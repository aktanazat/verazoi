import WidgetKit
import SwiftUI

struct VerazoiEntry: TimelineEntry {
    let date: Date
    let stabilityScore: Int
    let spikeRisk: Int
    let lastGlucose: Int?
    let lastGlucoseTime: String?
}

struct VerazoiProvider: TimelineProvider {
    private let defaults = UserDefaults(suiteName: "group.verazoi.app")

    func placeholder(in context: Context) -> VerazoiEntry {
        VerazoiEntry(date: .now, stabilityScore: 72, spikeRisk: 25, lastGlucose: 105, lastGlucoseTime: "2:30 PM")
    }

    func getSnapshot(in context: Context, completion: @escaping (VerazoiEntry) -> Void) {
        completion(readEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VerazoiEntry>) -> Void) {
        let entry = readEntry()
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }

    private func readEntry() -> VerazoiEntry {
        let score = defaults?.integer(forKey: "widget_stability_score") ?? 0
        let risk = defaults?.integer(forKey: "widget_spike_risk") ?? 0
        let glucose = defaults?.integer(forKey: "widget_last_glucose")
        let time = defaults?.string(forKey: "widget_last_glucose_time")
        return VerazoiEntry(
            date: .now,
            stabilityScore: score,
            spikeRisk: risk,
            lastGlucose: glucose == 0 ? nil : glucose,
            lastGlucoseTime: time
        )
    }
}

struct VerazoiWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: VerazoiEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidget(entry: entry)
        default:
            MediumWidget(entry: entry)
        }
    }
}

private struct SmallWidget: View {
    let entry: VerazoiEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("STABILITY")
                .font(.system(size: 9, weight: .medium))
                .tracking(1.5)
                .foregroundStyle(.secondary)

            Text("\(entry.stabilityScore)")
                .font(.system(size: 44, weight: .light, design: .serif))
                .foregroundStyle(.primary)

            Spacer()

            if let glucose = entry.lastGlucose {
                Text("\(glucose) mg/dL")
                    .font(.system(size: 13, weight: .medium, design: .monospaced))
                    .foregroundStyle(.primary)
                if let time = entry.lastGlucoseTime {
                    Text(time)
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .containerBackground(.background, for: .widget)
    }
}

private struct MediumWidget: View {
    let entry: VerazoiEntry

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 0) {
                Text("STABILITY")
                    .font(.system(size: 9, weight: .medium))
                    .tracking(1.5)
                    .foregroundStyle(.secondary)

                Text("\(entry.stabilityScore)")
                    .font(.system(size: 44, weight: .light, design: .serif))
                    .foregroundStyle(.primary)

                Text(scoreLabel(entry.stabilityScore))
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Divider().padding(.vertical, 8)

            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("SPIKE RISK")
                        .font(.system(size: 9, weight: .medium))
                        .tracking(1.5)
                        .foregroundStyle(.secondary)
                    Text("\(entry.spikeRisk)%")
                        .font(.system(size: 20, weight: .medium, design: .monospaced))
                        .foregroundStyle(.primary)
                }

                if let glucose = entry.lastGlucose {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("GLUCOSE")
                            .font(.system(size: 9, weight: .medium))
                            .tracking(1.5)
                            .foregroundStyle(.secondary)
                        Text("\(glucose) mg/dL")
                            .font(.system(size: 15, weight: .medium, design: .monospaced))
                            .foregroundStyle(.primary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 16)
        }
        .containerBackground(.background, for: .widget)
    }

    private func scoreLabel(_ score: Int) -> String {
        if score >= 80 { return "Excellent" }
        if score >= 60 { return "Good" }
        if score >= 40 { return "Fair" }
        return "Needs attention"
    }
}

@main
struct VerazoiWidgetBundle: WidgetBundle {
    var body: some Widget {
        StabilityWidget()
    }
}

struct StabilityWidget: Widget {
    let kind = "VerazoiStability"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VerazoiProvider()) { entry in
            VerazoiWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Stability Score")
        .description("Your metabolic stability at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
