import Foundation
import Observation

@Observable
final class WearableState {
    var connectedProvider: WearableProvider?
    var connectionStatus: ConnectionStatus = .disconnected
    var connectionError: String?
    var lastSyncDate: Date?
    var autoSync: Bool = true
    var syncInterval: SyncInterval = .fifteenMinutes

    var latestHeartRate: Int?
    var todaySteps: Int?
    var todayActiveMinutes: Int?
    var lastSleepHours: Double?
    var lastSleepQuality: String?

    private var syncTimer: Timer?

    func connect(to provider: WearableProvider) {
        connectionStatus = .connecting
        connectionError = nil

        Task { @MainActor in
            let hk = HealthKitManager.shared
            guard await hk.isAvailable else {
                connectionStatus = .disconnected
                connectionError = "Health data is not available on this device."
                return
            }

            do {
                try await hk.requestAuthorization()
            } catch {
                connectionStatus = .disconnected
                connectionError = "Authorization failed."
                return
            }

            connectedProvider = provider
            connectionStatus = .connected
            await syncFromHealthKit()

            let hasData = latestHeartRate != nil || todaySteps != nil || todayActiveMinutes != nil || lastSleepHours != nil
            if !hasData {
                connectionError = "No health data found yet. Make sure Verazoi has access in Settings > Privacy & Security > Health."
            }

            startAutoSync()
        }
    }

    func disconnect() {
        syncTimer?.invalidate()
        syncTimer = nil
        connectedProvider = nil
        connectionStatus = .disconnected
        lastSyncDate = nil
        latestHeartRate = nil
        todaySteps = nil
        todayActiveMinutes = nil
        lastSleepHours = nil
        lastSleepQuality = nil
    }

    func syncNow() {
        guard connectedProvider != nil else { return }
        connectionStatus = .syncing
        Task { @MainActor in
            await syncFromHealthKit()
            connectionStatus = .connected
        }
    }

    @MainActor
    private func syncFromHealthKit() async {
        let hk = HealthKitManager.shared

        async let hr = hk.fetchLatestHeartRate()
        async let steps = hk.fetchTodaySteps()
        async let active = hk.fetchTodayActiveMinutes()
        async let sleep = hk.fetchLastSleep()

        latestHeartRate = await hr
        todaySteps = await steps
        todayActiveMinutes = await active

        if let sleepData = await sleep {
            lastSleepHours = sleepData.hours
            lastSleepQuality = sleepData.quality
        }

        lastSyncDate = Date()
    }

    private func startAutoSync() {
        syncTimer?.invalidate()
        guard autoSync else { return }

        let interval: TimeInterval
        switch syncInterval {
        case .fiveMinutes: interval = 300
        case .fifteenMinutes: interval = 900
        case .thirtyMinutes: interval = 1800
        case .oneHour: interval = 3600
        }

        syncTimer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.syncNow()
        }
    }
}

enum SyncInterval: String, CaseIterable {
    case fiveMinutes = "5 min"
    case fifteenMinutes = "15 min"
    case thirtyMinutes = "30 min"
    case oneHour = "1 hour"
}
