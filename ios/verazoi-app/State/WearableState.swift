import Foundation
import Observation

@Observable
final class WearableState {
    var connectedProvider: WearableProvider?
    var connectionStatus: ConnectionStatus = .disconnected
    var connectionError: String?
    var lastSyncDate: Date?
    var autoSync: Bool = true {
        didSet { save(); restartAutoSync() }
    }
    var syncInterval: SyncInterval = .fifteenMinutes {
        didSet { save(); restartAutoSync() }
    }

    var latestHeartRate: Int?
    var todaySteps: Int?
    var todayActiveMinutes: Int?
    var lastSleepHours: Double?
    var lastSleepQuality: String?

    private var syncTimer: Timer?

    private let providerKey = "verazoi_wearable_provider"
    private let autoSyncKey = "verazoi_auto_sync"
    private let syncIntervalKey = "verazoi_sync_interval"

    init() {
        let defaults = UserDefaults.standard
        autoSync = defaults.object(forKey: autoSyncKey) as? Bool ?? true

        if let intervalRaw = defaults.string(forKey: syncIntervalKey),
           let interval = SyncInterval(rawValue: intervalRaw) {
            syncInterval = interval
        }

        if let providerRaw = defaults.string(forKey: providerKey),
           let provider = WearableProvider(rawValue: providerRaw) {
            connectedProvider = provider
            connectionStatus = .connected
            // Sync immediately on restore
            Task { @MainActor in
                await syncFromHealthKit()
                startAutoSync()
            }
        }
    }

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
                connectionError = "Health authorization failed. Check Settings > Privacy & Security > Health."
                return
            }

            connectedProvider = provider
            connectionStatus = .connected
            save()

            await syncFromHealthKit()

            let hasData = latestHeartRate != nil || todaySteps != nil || todayActiveMinutes != nil || lastSleepHours != nil
            if !hasData {
                if let hint = provider.setupHint {
                    connectionError = "No health data found. \(hint)"
                } else {
                    connectionError = "No health data found. Make sure Verazoi has access in Settings > Privacy & Security > Health."
                }
            }

            startAutoSync()
        }
    }

    func disconnect() {
        syncTimer?.invalidate()
        syncTimer = nil
        connectedProvider = nil
        connectionStatus = .disconnected
        connectionError = nil
        lastSyncDate = nil
        latestHeartRate = nil
        todaySteps = nil
        todayActiveMinutes = nil
        lastSleepHours = nil
        lastSleepQuality = nil
        save()
    }

    func syncNow() {
        guard connectedProvider != nil else { return }
        connectionStatus = .syncing
        connectionError = nil
        Task { @MainActor in
            await syncFromHealthKit()
            connectionStatus = .connected
        }
    }

    @MainActor
    private func syncFromHealthKit() async {
        let hk = HealthKitManager.shared

        async let hr = hk.fetchRestingHeartRate()
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

    private func save() {
        let defaults = UserDefaults.standard
        defaults.set(connectedProvider?.rawValue, forKey: providerKey)
        defaults.set(autoSync, forKey: autoSyncKey)
        defaults.set(syncInterval.rawValue, forKey: syncIntervalKey)
    }

    private func restartAutoSync() {
        guard connectedProvider != nil else { return }
        startAutoSync()
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
