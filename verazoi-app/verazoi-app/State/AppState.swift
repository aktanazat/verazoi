import Foundation
import Observation

@Observable
final class AppState {
    var meals: [Meal] = []
    var glucoseReadings: [GlucoseReading] = []
    var activities: [ActivityEntry] = []
    var sleepEntries: [SleepEntry] = []
    var timeline: [TimelineEvent] = []
    var stabilityScore: Int = 0
    var stabilityResult: StabilityResult?
    var isSyncing = false

    weak var wearable: WearableState?

    private func nowTime() -> String {
        Date().formatted(date: .omitted, time: .shortened)
    }

    func recalcScore() {
        let input = StabilityInput(
            glucoseReadings: glucoseReadings,
            activities: activities,
            sleepEntries: sleepEntries,
            wearableHeartRate: wearable?.latestHeartRate,
            wearableSteps: wearable?.todaySteps,
            wearableActiveMinutes: wearable?.todayActiveMinutes,
            wearableSleepHours: wearable?.lastSleepHours
        )
        let result = StabilityAlgorithm.calculate(input: input)
        stabilityScore = result.score
        stabilityResult = result
    }

    func addGlucoseReading(value: Int, timing: GlucoseTiming) {
        let time = nowTime()
        glucoseReadings.append(GlucoseReading(time: time, value: value, timing: timing))
        timeline.append(TimelineEvent(time: time, type: .glucose, label: timing.displayName, value: "\(value) mg/dL"))
        recalcScore()
        Task {
            try? await APIClient.shared.createGlucose(value: value, timing: timing.rawValue)
        }
    }

    func addMeal(mealType: String, foods: [String], notes: String) {
        let time = nowTime()
        meals.append(Meal(time: time, mealType: mealType, foods: foods, notes: notes))
        timeline.append(TimelineEvent(time: time, type: .meal, label: mealType, value: foods.joined(separator: ", ")))
        Task {
            try? await APIClient.shared.createMeal(mealType: mealType, foods: foods, notes: notes)
        }
    }

    func addActivity(activityType: String, duration: Int, intensity: String) {
        let time = nowTime()
        activities.append(ActivityEntry(time: time, activityType: activityType, duration: duration, intensity: intensity))
        timeline.append(TimelineEvent(time: time, type: .activity, label: activityType, value: "\(duration) min, \(intensity.lowercased())"))
        recalcScore()
        Task {
            try? await APIClient.shared.createActivity(activityType: activityType, duration: duration, intensity: intensity)
        }
    }

    func addSleep(hours: Double, quality: String) {
        let time = nowTime()
        sleepEntries.append(SleepEntry(time: time, hours: hours, quality: quality))
        timeline.append(TimelineEvent(time: time, type: .sleep, label: "Sleep logged", value: "\(hours) hrs, \(quality)"))
        recalcScore()
        Task {
            try? await APIClient.shared.createSleep(hours: hours, quality: quality)
        }
    }

    func fetchFromBackend() async {
        isSyncing = true
        do {
            async let glucoseTask = APIClient.shared.listGlucose()
            async let mealsTask = APIClient.shared.listMeals()
            async let activitiesTask = APIClient.shared.listActivities()
            async let sleepTask = APIClient.shared.listSleep()
            async let timelineTask = APIClient.shared.listTimeline()
            async let scoreTask = APIClient.shared.getStabilityScore()

            let (remoteGlucose, remoteMeals, remoteActivities, remoteSleep, remoteTimeline, serverScore) = try await (
                glucoseTask, mealsTask, activitiesTask, sleepTask, timelineTask, scoreTask
            )

            glucoseReadings = remoteGlucose.map {
                GlucoseReading(
                    time: $0.recordedAt.formatted(date: .omitted, time: .shortened),
                    value: $0.value,
                    timing: GlucoseTiming(rawValue: $0.timing) ?? .fasting
                )
            }

            meals = remoteMeals.map {
                Meal(
                    time: $0.recordedAt.formatted(date: .omitted, time: .shortened),
                    mealType: $0.mealType,
                    foods: $0.foods,
                    notes: $0.notes
                )
            }

            activities = remoteActivities.map {
                ActivityEntry(
                    time: $0.recordedAt.formatted(date: .omitted, time: .shortened),
                    activityType: $0.activityType,
                    duration: $0.duration,
                    intensity: $0.intensity
                )
            }

            sleepEntries = remoteSleep.map {
                SleepEntry(
                    time: $0.recordedAt.formatted(date: .omitted, time: .shortened),
                    hours: $0.hours,
                    quality: $0.quality
                )
            }

            timeline = remoteTimeline.map {
                TimelineEvent(
                    time: $0.recordedAt.formatted(date: .omitted, time: .shortened),
                    type: EventType(rawValue: $0.type) ?? .glucose,
                    label: $0.label,
                    value: $0.value
                )
            }

            stabilityScore = serverScore.score
        } catch {
            recalcScore()
        }
        isSyncing = false
    }

    func syncWearableToBackend() {
        guard let w = wearable else { return }
        Task {
            try? await APIClient.shared.syncWearable(
                heartRate: w.latestHeartRate,
                steps: w.todaySteps,
                activeMinutes: w.todayActiveMinutes,
                sleepHours: w.lastSleepHours,
                sleepQuality: w.lastSleepQuality
            )
        }
    }
}
