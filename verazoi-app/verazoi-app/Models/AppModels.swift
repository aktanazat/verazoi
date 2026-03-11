import Foundation

struct TimelineEvent: Identifiable {
    let id = UUID()
    let time: String
    let type: EventType
    let label: String
    let value: String
}

enum EventType: String {
    case glucose
    case meal
    case activity
    case sleep

    var systemImage: String {
        switch self {
        case .glucose: "drop"
        case .meal: "fork.knife"
        case .activity: "figure.walk"
        case .sleep: "moon"
        }
    }
}

struct GlucoseReading: Identifiable {
    let id = UUID()
    let time: String
    let value: Int
    let timing: GlucoseTiming
}

enum GlucoseTiming: String, CaseIterable {
    case fasting
    case before
    case after

    var displayName: String {
        switch self {
        case .fasting: "Fasting"
        case .before: "Pre-meal"
        case .after: "Post-meal"
        }
    }
}

struct Meal: Identifiable {
    let id = UUID()
    let time: String
    let mealType: String
    let foods: [String]
    let notes: String
}

struct ActivityEntry: Identifiable {
    let id = UUID()
    let time: String
    let activityType: String
    let duration: Int
    let intensity: String
}

struct SleepEntry: Identifiable {
    let id = UUID()
    let time: String
    let hours: Double
    let quality: String
}
