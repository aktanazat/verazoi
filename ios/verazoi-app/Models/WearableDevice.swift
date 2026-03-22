import Foundation

enum WearableProvider: String, CaseIterable, Identifiable, Codable {
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
        case .appleWatch: "Reads heart rate, steps, workouts, and sleep directly from Apple Health."
        case .garmin: "Reads data synced from Garmin Connect to Apple Health."
        case .samsung: "Reads data synced from Samsung Health to Apple Health."
        }
    }

    var syncCapabilities: [SyncCapability] {
        switch self {
        case .appleWatch:
            return [.heartRate, .steps, .workouts, .sleep, .restingEnergy, .activeEnergy]
        case .garmin:
            return [.heartRate, .steps, .workouts, .sleep]
        case .samsung:
            return [.heartRate, .steps, .workouts, .sleep]
        }
    }

    var setupHint: String? {
        switch self {
        case .appleWatch: nil
        case .garmin: "Make sure Garmin Connect is syncing to Apple Health in Garmin Connect > Settings > Health."
        case .samsung: "Make sure Samsung Health is syncing to Apple Health in Samsung Health > Settings."
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
}

enum ConnectionStatus: String {
    case disconnected = "Not connected"
    case connecting = "Connecting..."
    case connected = "Connected"
    case syncing = "Syncing..."
}
