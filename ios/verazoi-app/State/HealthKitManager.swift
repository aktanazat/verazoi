import Foundation
import HealthKit

actor HealthKitManager {
    static let shared = HealthKitManager()

    private let store = HKHealthStore()

    private let readTypes: Set<HKSampleType> = [
        HKQuantityType(.heartRate),
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

    func canReadAnyData() async -> Bool {
        async let hr = fetchLatestHeartRate()
        async let steps = fetchTodaySteps()
        async let active = fetchTodayActiveMinutes()
        async let sleep = fetchLastSleep()

        let results = await (hr, steps, active, sleep)
        return results.0 != nil || results.1 != nil || results.2 != nil || results.3 != nil
    }

    func fetchLatestHeartRate() async -> Int? {
        await fetchLatestQuantity(.heartRate, unit: HKUnit.count().unitDivided(by: .minute()))
            .map { Int($0) }
    }

    func fetchTodaySteps() async -> Int? {
        await fetchTodayCumulativeSum(.stepCount, unit: .count())
            .map { Int($0) }
    }

    func fetchTodayActiveMinutes() async -> Int? {
        await fetchTodayCumulativeSum(.appleExerciseTime, unit: .minute())
            .map { Int($0) }
    }

    func fetchLastSleep() async -> (hours: Double, quality: String)? {
        let type = HKCategoryType(.sleepAnalysis)
        let now = Date()
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: now)!
        let predicate = HKQuery.predicateForSamples(withStart: yesterday, end: now, options: .strictEndDate)
        let descriptor = HKSampleQueryDescriptor(predicates: [.categorySample(type: type, predicate: predicate)], sortDescriptors: [SortDescriptor(\.endDate, order: .reverse)], limit: 20)

        let samples = (try? await descriptor.result(for: store)) ?? []
        let asleepSamples = samples.filter { $0.value != HKCategoryValueSleepAnalysis.inBed.rawValue }

        guard !asleepSamples.isEmpty else { return nil }

        let totalSeconds = asleepSamples.reduce(0.0) { sum, sample in
            sum + sample.endDate.timeIntervalSince(sample.startDate)
        }
        let hours = totalSeconds / 3600

        let quality: String
        switch hours {
        case 8...: quality = "great"
        case 7..<8: quality = "good"
        case 6..<7: quality = "fair"
        default: quality = "poor"
        }

        return (hours: (hours * 10).rounded() / 10, quality: quality)
    }

    // MARK: - Helpers

    private func fetchLatestQuantity(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        let type = HKQuantityType(identifier)
        let now = Date()
        let dayAgo = Calendar.current.date(byAdding: .day, value: -1, to: now)!
        let predicate = HKQuery.predicateForSamples(withStart: dayAgo, end: now, options: .strictEndDate)
        let descriptor = HKSampleQueryDescriptor(predicates: [.quantitySample(type: type, predicate: predicate)], sortDescriptors: [SortDescriptor(\.startDate, order: .reverse)], limit: 1)

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
