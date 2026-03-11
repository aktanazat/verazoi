import Foundation

enum WearableProvider: String, CaseIterable, Identifiable {
    case appleWatch = "Apple Watch"
    case garmin = "Garmin"
    case samsung = "Samsung Galaxy Watch"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .appleWatch: "applewatch"
        case .garmin: "location.north.circle"
        case .samsung: "circle.grid.2x2"
        }
    }

    var description: String {
        switch self {
        case .appleWatch: "Syncs heart rate, steps, workouts, and sleep via HealthKit."
        case .garmin: "Syncs activity, sleep, heart rate, and stress via Garmin Connect."
        case .samsung: "Syncs activity, sleep, and heart rate via Samsung Health."
        }
    }

    var syncCapabilities: [SyncCapability] {
        switch self {
        case .appleWatch:
            return [.heartRate, .steps, .workouts, .sleep, .restingEnergy, .activeEnergy]
        case .garmin:
            return [.heartRate, .steps, .workouts, .sleep, .stress, .bodyBattery]
        case .samsung:
            return [.heartRate, .steps, .workouts, .sleep, .stress]
        }
    }
}

enum SyncCapability: String {
    case heartRate = "Heart Rate"
    case steps = "Steps"
    case workouts = "Workouts"
    case sleep = "Sleep"
    case restingEnergy = "Resting Energy"
    case activeEnergy = "Active Energy"
    case stress = "Stress"
    case bodyBattery = "Body Battery"
}

enum ConnectionStatus: String {
    case disconnected = "Not connected"
    case connecting = "Connecting..."
    case connected = "Connected"
    case syncing = "Syncing..."
}
