import Foundation
import HealthKit

actor HealthKitManager {
    static let shared = HealthKitManager()

    private let store = HKHealthStore()

    private let readTypes: Set<HKSampleType> = [
        HKQuantityType(.heartRate),
        HKQuantityType(.restingHeartRate),
        HKQuantityType(.stepCount),
        HKQuantityType(.appleExerciseTime),
        HKCategoryType(.sleepAnalysis),
    ]

    var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async throws {
        try await store.requestAuthorization(toShare: [], read: readTypes)
    }

    func authorizationStatus(for type: HKQuantityTypeIdentifier) -> HKAuthorizationStatus {
        store.authorizationStatus(for: HKQuantityType(type))
    }

    // MARK: - Heart Rate

    func fetchRestingHeartRate() async -> Int? {
        // Try resting HR first (computed by Apple Watch overnight)
        if let resting = await fetchLatestQuantity(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute()), dayRange: 7) {
            return Int(resting)
        }
        // Fall back to latest heart rate reading in past 24h
        return await fetchLatestQuantity(.heartRate, unit: HKUnit.count().unitDivided(by: .minute()), dayRange: 1)
            .map { Int($0) }
    }

    // MARK: - Steps & Activity

    func fetchTodaySteps() async -> Int? {
        await fetchTodayCumulativeSum(.stepCount, unit: .count())
            .map { Int($0) }
    }

    func fetchTodayActiveMinutes() async -> Int? {
        await fetchTodayCumulativeSum(.appleExerciseTime, unit: .minute())
            .map { Int($0) }
    }

    // MARK: - Sleep

    func fetchLastSleep() async -> (hours: Double, quality: String)? {
        let type = HKCategoryType(.sleepAnalysis)
        let now = Date()
        guard let twoDaysAgo = Calendar.current.date(byAdding: .day, value: -2, to: now) else { return nil }
        let predicate = HKQuery.predicateForSamples(withStart: twoDaysAgo, end: now, options: .strictEndDate)
        let descriptor = HKSampleQueryDescriptor(
            predicates: [.categorySample(type: type, predicate: predicate)],
            sortDescriptors: [SortDescriptor(\.endDate, order: .reverse)],
            limit: 50
        )

        let samples = (try? await descriptor.result(for: store)) ?? []
        let asleepSamples = samples.filter { $0.value != HKCategoryValueSleepAnalysis.inBed.rawValue }
        guard !asleepSamples.isEmpty else { return nil }

        let totalSeconds = asleepSamples.reduce(0.0) { sum, sample in
            sum + sample.endDate.timeIntervalSince(sample.startDate)
        }
        let hours = totalSeconds / 3600

        // Derive quality from sleep stage composition if available
        let deepCount = asleepSamples.filter { $0.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue }.count
        let remCount = asleepSamples.filter { $0.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue }.count
        let hasStages = deepCount > 0 || remCount > 0

        let quality: String
        if hasStages {
            let stageRatio = Double(deepCount + remCount) / Double(asleepSamples.count)
            // Deep + REM should be ~40-50% of total sleep for quality sleep
            switch (hours, stageRatio) {
            case (7..., 0.35...): quality = "great"
            case (6.5..., 0.25...): quality = "good"
            case (5.5..., 0.15...): quality = "fair"
            default: quality = "poor"
            }
        } else {
            // No stage data (e.g. Garmin/Samsung) - estimate from duration
            switch hours {
            case 8...: quality = "great"
            case 7..<8: quality = "good"
            case 6..<7: quality = "fair"
            default: quality = "poor"
            }
        }

        return (hours: (hours * 10).rounded() / 10, quality: quality)
    }

    // MARK: - Helpers

    private func fetchLatestQuantity(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit, dayRange: Int = 1) async -> Double? {
        let type = HKQuantityType(identifier)
        let now = Date()
        guard let start = Calendar.current.date(byAdding: .day, value: -dayRange, to: now) else { return nil }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: now, options: .strictEndDate)
        let descriptor = HKSampleQueryDescriptor(
            predicates: [.quantitySample(type: type, predicate: predicate)],
            sortDescriptors: [SortDescriptor(\.startDate, order: .reverse)],
            limit: 1
        )

        guard let sample = try? await descriptor.result(for: store).first else { return nil }
        return sample.quantity.doubleValue(for: unit)
    }

    private func fetchTodayCumulativeSum(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        let type = HKQuantityType(identifier)
        let start = Calendar.current.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: start, end: Date(), options: .strictEndDate)

        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, _ in
                let value = result?.sumQuantity()?.doubleValue(for: unit)
                continuation.resume(returning: value)
            }
            store.execute(query)
        }
    }
}
