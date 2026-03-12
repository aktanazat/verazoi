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
    case medication

    var systemImage: String {
        switch self {
        case .glucose: "drop"
        case .meal: "fork.knife"
        case .activity: "figure.walk"
        case .sleep: "moon"
        case .medication: "pill"
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

struct MedicationEntry: Identifiable {
    let id = UUID()
    let time: String
    let name: String
    let doseValue: Double
    let doseUnit: String
    let timing: String
    let notes: String
}

struct UserGoals {
    var glucoseLow: Int = 70
    var glucoseHigh: Int = 140
    var dailySteps: Int = 10000
    var sleepHours: Double = 8
}

struct GoalProgress {
    var glucoseInRangePct: Double = 0
    var stepsToday: Int = 0
    var stepsTarget: Int = 10000
    var sleepLast: Double = 0
    var sleepTarget: Double = 8
}

struct GlucoseTrendPoint: Identifiable {
    let id = UUID()
    let date: String
    let avg: Double
    let min: Int
    let max: Int
}

struct StabilityTrendPoint: Identifiable {
    let id = UUID()
    let date: String
    let score: Int
}

struct FoodImpact: Identifiable {
    let id = UUID()
    let food: String
    let avgDelta: Double
    let occurrences: Int
}

struct WeeklyInsight: Identifiable {
    let id: String
    let weekStart: String
    let summary: String
    let generatedAt: String
}

enum MedicationTiming: String, CaseIterable {
    case before_meal
    case with_meal
    case after_meal
    case bedtime
    case morning
    case other

    var displayName: String {
        switch self {
        case .before_meal: "Before meal"
        case .with_meal: "With meal"
        case .after_meal: "After meal"
        case .bedtime: "Bedtime"
        case .morning: "Morning"
        case .other: "Other"
        }
    }
}
