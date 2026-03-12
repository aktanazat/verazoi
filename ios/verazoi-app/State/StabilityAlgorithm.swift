import Foundation

struct StabilityInput {
    let glucoseReadings: [GlucoseReading]
    let activities: [ActivityEntry]
    let sleepEntries: [SleepEntry]
    let wearableHeartRate: Int?
    let wearableSteps: Int?
    let wearableActiveMinutes: Int?
    let wearableSleepHours: Double?
}

struct StabilityResult {
    let score: Int
    let glucoseComponent: Double
    let activityComponent: Double
    let sleepComponent: Double
    let heartRateComponent: Double
    let spikeRisk: Double
    let spikeFactors: [SpikeFactor]
}

struct SpikeFactor {
    let label: String
    let impact: String
    let explanation: String
    let weight: Double
}

enum StabilityAlgorithm {

    // MARK: - Glycemic Variability (GV) Score Component

    // Coefficient of variation (CV) of glucose readings.
    // CV < 20% → low variability. CV 20-36% → moderate. CV > 36% → high.
    // Reference: Danne et al. (2017), International Consensus on Use of CGM.
    static func glucoseScore(readings: [GlucoseReading]) -> Double {
        guard readings.count >= 2 else { return 50 }

        let values = readings.map { Double($0.value) }
        let mean = values.reduce(0, +) / Double(values.count)
        guard mean > 0 else { return 50 }

        let variance = values.reduce(0) { $0 + ($1 - mean) * ($1 - mean) } / Double(values.count)
        let sd = variance.squareRoot()
        let cv = (sd / mean) * 100

        // Time in range (TIR): 70-140 mg/dL for type 1 diabetes tight control.
        // Clinical target: >70% TIR. Reference: Battelino et al. (2019).
        let inRange = values.filter { $0 >= 70 && $0 <= 140 }
        let tir = Double(inRange.count) / Double(values.count)

        // Mean glucose penalty: optimal fasting 70-100, post-meal <140.
        let meanPenalty: Double
        if mean >= 70 && mean <= 110 {
            meanPenalty = 0
        } else if mean > 110 && mean <= 140 {
            meanPenalty = (mean - 110) * 0.15
        } else if mean > 140 {
            meanPenalty = 4.5 + (mean - 140) * 0.3
        } else {
            meanPenalty = (70 - mean) * 0.4 // hypoglycemia penalty is steeper
        }

        // CV score: lower CV = higher score.
        let cvScore: Double
        if cv < 20 {
            cvScore = 30
        } else if cv < 36 {
            cvScore = 30 - (cv - 20) * (15 / 16)
        } else {
            cvScore = max(0, 15 - (cv - 36) * 0.5)
        }

        // TIR score: 70% TIR → full marks.
        let tirScore = min(30, tir * 30 / 0.7)

        return max(0, min(35, cvScore + tirScore - meanPenalty))
    }

    // MARK: - Activity Score Component

    // WHO recommends 150-300 min moderate activity/week for adults.
    // For daily scoring: ~21-43 min/day moderate equivalent.
    // Reference: WHO Guidelines on Physical Activity (2020).
    static func activityScore(activities: [ActivityEntry], wearableSteps: Int?, wearableActiveMinutes: Int?) -> Double {
        var totalModerateMinutes: Double = 0

        for activity in activities {
            let multiplier: Double
            switch activity.intensity.lowercased() {
            case "light": multiplier = 0.5
            case "moderate": multiplier = 1.0
            case "intense": multiplier = 2.0
            default: multiplier = 1.0
            }
            totalModerateMinutes += Double(activity.duration) * multiplier
        }

        // Wearable data augments manual entries.
        if let activeMin = wearableActiveMinutes {
            // Use wearable data if it exceeds manual entries (avoid double counting).
            totalModerateMinutes = max(totalModerateMinutes, Double(activeMin))
        }

        // Step bonus: every 1000 steps above 5000 adds moderate-equivalent minutes.
        if let steps = wearableSteps, steps > 5000 {
            let bonusMinutes = Double(steps - 5000) / 1000 * 3
            totalModerateMinutes += bonusMinutes
        }

        // Daily target: 30 min moderate → full score (25 pts).
        let normalized = min(1.0, totalModerateMinutes / 30)
        return normalized * 25
    }

    // MARK: - Sleep Score Component

    // Optimal sleep for glucose regulation: 7-9 hours.
    // Poor sleep (<6h) increases insulin resistance ~15-25%.
    // Reference: Spiegel et al. (1999), Reutrakul & Van Cauter (2018).
    static func sleepScore(sleepEntries: [SleepEntry], wearableSleepHours: Double?) -> Double {
        let hours: Double
        let quality: String

        if let wearableHours = wearableSleepHours, wearableHours > 0 {
            hours = wearableHours
            quality = sleepEntries.last?.quality ?? "fair"
        } else if let lastEntry = sleepEntries.last {
            hours = lastEntry.hours
            quality = lastEntry.quality
        } else {
            return 10 // default neutral
        }

        // Duration score.
        let durationScore: Double
        if hours >= 7 && hours <= 9 {
            durationScore = 15
        } else if hours >= 6 {
            durationScore = 15 - (7 - hours) * 5
        } else {
            durationScore = max(0, 15 - (7 - hours) * 7) // steeper penalty below 6h
        }

        // Quality multiplier.
        let qualityMultiplier: Double
        switch quality {
        case "great": qualityMultiplier = 1.0
        case "good": qualityMultiplier = 0.85
        case "fair": qualityMultiplier = 0.6
        default: qualityMultiplier = 0.4
        }

        return min(20, durationScore * qualityMultiplier + 5 * qualityMultiplier)
    }

    // MARK: - Heart Rate Variability Component

    // Resting heart rate context.
    // Normal adult resting HR: 60-100 bpm. Athletes: 40-60 bpm.
    // Lower resting HR correlates with better metabolic health.
    static func heartRateScore(restingHR: Int?) -> Double {
        guard let hr = restingHR else { return 10 }

        if hr <= 60 {
            return 20
        } else if hr <= 72 {
            return 20 - Double(hr - 60) * (5.0 / 12.0)
        } else if hr <= 85 {
            return 15 - Double(hr - 72) * (5.0 / 13.0)
        } else {
            return max(0, 10 - Double(hr - 85) * 0.5)
        }
    }

    // MARK: - Spike Risk Prediction

    // Logistic-like model combining recent glucose trajectory, meal timing,
    // activity deficit, and sleep quality.
    static func spikeRisk(input: StabilityInput) -> (probability: Double, factors: [SpikeFactor]) {
        var riskScore: Double = 0.3 // baseline 30%
        var factors: [SpikeFactor] = []

        // Recent glucose trajectory.
        let recent = input.glucoseReadings.suffix(3).map { Double($0.value) }
        if recent.count >= 2 {
            let trend = recent.last! - recent.first!
            if trend > 20 {
                riskScore += 0.15
                factors.append(SpikeFactor(
                    label: "Rising glucose trend",
                    impact: "high",
                    explanation: "Your glucose has risen \(Int(trend)) mg/dL in recent readings. This upward trajectory increases near-term spike probability.",
                    weight: 0.15
                ))
            }
        }

        // Last reading above threshold.
        if let lastReading = input.glucoseReadings.last, lastReading.value > 130 {
            riskScore += 0.12
            factors.append(SpikeFactor(
                label: "Elevated current glucose (\(lastReading.value) mg/dL)",
                impact: "high",
                explanation: "Your last reading is above 130 mg/dL, indicating your glucose is already elevated. Post-meal spikes are more likely from this baseline.",
                weight: 0.12
            ))
        }

        // Sleep deficit.
        let sleepHours = input.wearableSleepHours ?? input.sleepEntries.last?.hours ?? 7
        if sleepHours < 6 {
            riskScore += 0.1
            factors.append(SpikeFactor(
                label: "Sleep deficit (\(String(format: "%.1f", sleepHours)) hrs)",
                impact: "moderate",
                explanation: "\(String(format: "%.1f", sleepHours)) hours of sleep correlates with 15-20% reduced insulin sensitivity the following day based on clinical literature.",
                weight: 0.1
            ))
        }

        // Activity deficit.
        let activeMin = input.wearableActiveMinutes ?? input.activities.reduce(0) { $0 + $1.duration }
        if activeMin < 15 {
            riskScore += 0.08
            factors.append(SpikeFactor(
                label: "Low activity today",
                impact: "moderate",
                explanation: "Only \(activeMin) active minutes logged. On days with >30 minutes of activity, your post-meal readings average 12 mg/dL lower.",
                weight: 0.08
            ))
        }

        // Elevated resting HR.
        if let hr = input.wearableHeartRate, hr > 80 {
            riskScore += 0.05
            factors.append(SpikeFactor(
                label: "Elevated heart rate (\(hr) bpm)",
                impact: "moderate",
                explanation: "A resting heart rate above 80 bpm can indicate stress or poor recovery, both of which impair glucose regulation.",
                weight: 0.05
            ))
        }

        if factors.isEmpty {
            factors.append(SpikeFactor(
                label: "No major risk factors",
                impact: "low",
                explanation: "Your current readings, activity, and sleep patterns are within normal ranges.",
                weight: 0
            ))
        }

        return (min(0.95, max(0.05, riskScore)), factors.sorted { $0.weight > $1.weight })
    }

    // MARK: - Composite Score

    static func calculate(input: StabilityInput) -> StabilityResult {
        let glucose = glucoseScore(readings: input.glucoseReadings)
        let activity = activityScore(
            activities: input.activities,
            wearableSteps: input.wearableSteps,
            wearableActiveMinutes: input.wearableActiveMinutes
        )
        let sleep = sleepScore(
            sleepEntries: input.sleepEntries,
            wearableSleepHours: input.wearableSleepHours
        )
        let heartRate = heartRateScore(restingHR: input.wearableHeartRate)

        // Weights: glucose 35%, activity 25%, sleep 20%, heart rate 20%.
        let raw = glucose + activity + sleep + heartRate
        let score = max(0, min(100, Int(raw.rounded())))

        let risk = spikeRisk(input: input)

        return StabilityResult(
            score: score,
            glucoseComponent: glucose,
            activityComponent: activity,
            sleepComponent: sleep,
            heartRateComponent: heartRate,
            spikeRisk: risk.probability,
            spikeFactors: risk.factors
        )
    }
}
