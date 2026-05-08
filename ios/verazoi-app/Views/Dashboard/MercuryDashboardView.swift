import SwiftUI

private enum TrendRange: String, CaseIterable, Identifiable {
    case week = "7D"
    case month = "30D"
    case quarter = "90D"
    var id: String { rawValue }
    var days: Int { self == .week ? 7 : self == .month ? 30 : 90 }
    var label: String { self == .week ? "Last 7 days" : self == .month ? "Last 30 days" : "Last 90 days" }
}

struct MercuryDashboardView: View {
    @Environment(AppState.self) private var state
    @Environment(\.design) private var design
    @State private var range: TrendRange = .month

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    welcomeHeader
                    quickActions
                    chartCard
                    metricsCard
                    HStack(spacing: 14) {
                        spikeCard
                        goalsCard
                    }
                    wearableCard
                    timelineCard
                }
                .padding(.horizontal, 18)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
            .background(Color.vBackground.ignoresSafeArea())
            .refreshable { await state.fetchFromBackend() }
        }
    }

    private var welcomeHeader: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 4) {
                Text("OVERVIEW")
                    .font(.system(size: 10, weight: .medium))
                    .tracking(1.8)
                    .foregroundStyle(Color.vMutedForeground)
                Text("Welcome back")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.top, 6)
    }

    private var quickActions: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                NavigationLink(destination: GlucoseLogView()) { ActionPill(icon: "plus", label: "Glucose") }
                NavigationLink(destination: MealsLogView()) { ActionPill(icon: "fork.knife", label: "Meal") }
                NavigationLink(destination: ActivityLogView()) { ActionPill(icon: "figure.walk", label: "Activity") }
                NavigationLink(destination: TrendsView()) { ActionPill(icon: "chart.xyaxis.line", label: "Trends") }
                NavigationLink(destination: InsightView()) { ActionPill(icon: "sparkles", label: "Insights") }
            }
            .padding(.vertical, 2)
        }
    }

    private var chartCard: some View {
        MercuryCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 6) {
                            Text("Stability score")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Color.vForeground)
                            Circle()
                                .fill(Color.vPrimary.opacity(0.18))
                                .frame(width: 14, height: 14)
                                .overlay(
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 7, weight: .bold))
                                        .foregroundStyle(Color.vPrimary)
                                )
                        }
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text("\(state.stabilityScore)")
                                .font(.vSerif(40, weight: .light))
                                .foregroundStyle(Color.vForeground)
                            Text("/100")
                                .font(.system(size: 13))
                                .foregroundStyle(Color.vMutedForeground.opacity(0.75))
                        }
                        Text(range.label)
                            .font(.system(size: 11))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                    Spacer()
                    rangeSwitcher
                }

                StabilityTrendChart(values: trendValues)
                    .frame(height: 130)
                    .padding(.top, 4)

                trendAxis
            }
        }
    }

    private var rangeSwitcher: some View {
        HStack(spacing: 2) {
            ForEach(TrendRange.allCases) { r in
                Button {
                    withAnimation(.easeInOut(duration: 0.4)) { range = r }
                } label: {
                    Text(r.rawValue)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(range == r ? Color.vBackground : Color.vMutedForeground)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(range == r ? Color.vForeground : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 7))
                }
            }
        }
        .padding(2)
        .background(Color.vBackground)
        .clipShape(RoundedRectangle(cornerRadius: 9))
        .overlay(RoundedRectangle(cornerRadius: 9).stroke(Color.vBorder, lineWidth: 0.5))
    }

    private var trendValues: [Double] {
        let trend = state.stabilityTrend
        if !trend.isEmpty {
            let take = min(trend.count, range.days)
            return trend.suffix(take).map { Double($0.score) }
        }
        return Self.demoTrend(range.days)
    }

    private var trendAxis: some View {
        let labels = axisLabels()
        return GeometryReader { geo in
            ZStack(alignment: .topLeading) {
                ForEach(Array(labels.enumerated()), id: \.0) { i, label in
                    let frac = Double(i) / Double(max(labels.count - 1, 1))
                    let alignment: HorizontalAlignment = i == 0 ? .leading : (i == labels.count - 1 ? .trailing : .center)
                    Text(label)
                        .font(.system(size: 9))
                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                        .monospacedDigit()
                        .frame(width: 60, alignment: alignmentToTextAlignment(alignment))
                        .position(x: anchorX(frac: frac, width: geo.size.width, alignment: alignment), y: 8)
                }
            }
        }
        .frame(height: 16)
        .padding(.top, 2)
    }

    private func alignmentToTextAlignment(_ a: HorizontalAlignment) -> Alignment {
        switch a {
        case .leading: return .leading
        case .trailing: return .trailing
        default: return .center
        }
    }

    private func anchorX(frac: Double, width: CGFloat, alignment: HorizontalAlignment) -> CGFloat {
        let x = CGFloat(frac) * width
        switch alignment {
        case .leading: return x + 30
        case .trailing: return x - 30
        default: return x
        }
    }

    private func axisLabels() -> [String] {
        let formatter = DateFormatter()
        formatter.dateFormat = range == .week ? "EEE" : "MMM d"
        let count = range == .week ? 4 : 5
        let cal = Calendar.current
        let now = cal.startOfDay(for: Date())
        var out: [String] = []
        for i in 0..<count {
            let frac = Double(i) / Double(max(count - 1, 1))
            let dayOffset = -Double(range.days - 1) + frac * Double(range.days - 1)
            if let d = cal.date(byAdding: .day, value: Int(dayOffset.rounded()), to: now) {
                out.append(formatter.string(from: d))
            }
        }
        return out
    }

    private var metricsCard: some View {
        MercuryCard {
            VStack(spacing: 0) {
                HStack {
                    Text("Today's metrics")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Color.vForeground)
                    Spacer()
                    NavigationLink(destination: GlucoseLogView()) {
                        Text("View log")
                            .font(.system(size: 11))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                }
                .padding(.bottom, 6)

                MetricRow(token: "GL", label: "Latest glucose", hint: latestGlucoseHint, value: latestGlucose)
                divider
                MetricRow(token: "AV", label: "Average", hint: "mg/dL", value: averageGlucose)
                divider
                MetricRow(token: "IR", label: "In range", hint: "70-140 mg/dL", value: inRangePct)
                divider
                MetricRow(token: "SD", label: "Variability", hint: "standard deviation", value: variability)
            }
        }
    }

    private var divider: some View {
        Rectangle().fill(Color.vBorder.opacity(0.6)).frame(height: 0.5)
    }

    private var latestGlucose: String {
        if let v = state.glucoseReadings.last?.value { return "\(v)" }
        return "--"
    }
    private var latestGlucoseHint: String {
        let r = state.glucoseReadings
        guard r.count >= 2 else { return "mg/dL" }
        let delta = r[r.count - 1].value - r[r.count - 2].value
        if delta == 0 { return "mg/dL" }
        return "\(delta > 0 ? "+" : "")\(delta) vs prior"
    }
    private var averageGlucose: String {
        let r = state.glucoseReadings
        guard !r.isEmpty else { return "--" }
        let avg = r.reduce(0) { $0 + $1.value } / r.count
        return "\(avg)"
    }
    private var inRangePct: String {
        let r = state.glucoseReadings
        guard !r.isEmpty else { return "--" }
        let lo = state.goals.glucoseLow
        let hi = state.goals.glucoseHigh
        let inRange = r.filter { $0.value >= lo && $0.value <= hi }.count
        return "\(Int(round(Double(inRange) / Double(r.count) * 100)))%"
    }
    private var variability: String {
        let r = state.glucoseReadings
        guard r.count > 1 else { return "--" }
        let mean = Double(r.reduce(0) { $0 + $1.value }) / Double(r.count)
        let variance = r.reduce(0.0) { $0 + pow(Double($1.value) - mean, 2) } / Double(r.count)
        return "\(Int(round(variance.squareRoot())))"
    }

    private var spikeCard: some View {
        MercuryCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Spike risk")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(Color.vForeground)
                        Text("Next 4 hours")
                            .font(.system(size: 10))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                    Spacer()
                    Text(spikeLabel)
                        .font(.system(size: 10, weight: .medium))
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.vBackground)
                        .clipShape(Capsule())
                }
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("\(spikeRisk)")
                        .font(.vSerif(30, weight: .light))
                        .foregroundStyle(Color.vForeground)
                    Text("%")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vMutedForeground)
                }
                ProgressBar(progress: Double(spikeRisk) / 100.0, tint: Color.vPrimary.opacity(0.7))
                    .frame(height: 4)
            }
        }
    }

    private var spikeRisk: Int { Int(round((state.stabilityResult?.spikeRisk ?? 0) * 100)) }
    private var spikeLabel: String { spikeRisk >= 60 ? "Elevated" : spikeRisk >= 40 ? "Moderate" : "Low" }

    private var goalsCard: some View {
        MercuryCard {
            VStack(alignment: .leading, spacing: 10) {
                Text("Daily goals")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.vForeground)
                GoalRow(label: "Time in range", display: "\(Int(state.goalProgress.glucoseInRangePct))%", progress: state.goalProgress.glucoseInRangePct / 100.0)
                GoalRow(label: "Steps", display: "\(state.goalProgress.stepsToday) / \(state.goalProgress.stepsTarget)", progress: Double(state.goalProgress.stepsToday) / max(Double(state.goalProgress.stepsTarget), 1))
                GoalRow(label: "Sleep", display: "\(formatHours(state.goalProgress.sleepLast))/\(formatHours(state.goalProgress.sleepTarget))", progress: state.goalProgress.sleepLast / max(state.goalProgress.sleepTarget, 1))
            }
        }
    }

    private func formatHours(_ h: Double) -> String {
        let formatted = (h.truncatingRemainder(dividingBy: 1) == 0) ? String(format: "%.0fh", h) : String(format: "%.1fh", h)
        return formatted
    }

    private var wearableCard: some View {
        MercuryCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Wearable")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(Color.vForeground)
                        Text(state.wearable?.lastSyncDate != nil ? "Live data" : "Not connected")
                            .font(.system(size: 10))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                    Spacer()
                    if state.wearable?.lastSyncDate != nil {
                        Text("LIVE")
                            .font(.system(size: 9, weight: .semibold))
                            .tracking(1.2)
                            .foregroundStyle(Color.vPrimary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.vPrimary.opacity(0.08))
                            .clipShape(Capsule())
                    }
                }
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    Stat(label: "Heart rate", value: hrValue)
                    Stat(label: "Steps", value: stepsValue)
                    Stat(label: "Active", value: activeValue)
                    Stat(label: "Sleep", value: sleepValue)
                }
            }
        }
    }

    private var hrValue: String { state.wearable?.latestHeartRate.map { "\($0) bpm" } ?? "—" }
    private var stepsValue: String { state.wearable?.todaySteps.map { "\($0)" } ?? "—" }
    private var activeValue: String { state.wearable?.todayActiveMinutes.map { "\($0)m" } ?? "—" }
    private var sleepValue: String { state.wearable?.lastSleepHours.map { String(format: "%.1fh", $0) } ?? "—" }

    private var timelineCard: some View {
        MercuryCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Today's log")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Color.vForeground)
                    Spacer()
                    Text("\(state.timeline.count) entries")
                        .font(.system(size: 10))
                        .foregroundStyle(Color.vMutedForeground)
                }
                if state.timeline.isEmpty {
                    Text("No entries yet")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.vertical, 20)
                } else {
                    ForEach(Array(state.timeline.suffix(5).reversed().enumerated()), id: \.offset) { _, event in
                        TimelineRow(event: event)
                    }
                }
            }
        }
    }

    static func demoTrend(_ days: Int) -> [Double] {
        var rng = SeededRandom(seed: 42)
        var out: [Double] = []
        let baseline = days == 7 ? 71.0 : days == 30 ? 68.0 : 64.0
        let endValue = 82.0
        for i in 0..<days {
            let t = Double(i) / max(Double(days - 1), 1)
            let trend = baseline + (endValue - baseline) * pow(t, 0.85)
            let wave = sin(Double(i) * 0.6) * 1.6 + cos(Double(i) * 0.27) * 1.2
            let noise = (rng.next() - 0.5) * 2.4
            let score = max(40.0, min(95.0, (trend + wave + noise).rounded()))
            out.append(score)
        }
        return out
    }
}

private struct SeededRandom {
    private var state: UInt32
    init(seed: UInt32) { state = seed }
    mutating func next() -> Double {
        state = state &* 1664525 &+ 1013904223
        return Double(state) / Double(UInt32.max)
    }
}

private struct ActionPill: View {
    let icon: String
    let label: String
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(Color.vMutedForeground)
            Text(label)
                .font(.system(size: 12))
                .foregroundStyle(Color.vForeground.opacity(0.85))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 7)
        .background(Color.vCard.opacity(0.8))
        .overlay(Capsule().stroke(Color.vBorder, lineWidth: 0.5))
        .clipShape(Capsule())
    }
}

private struct MercuryCard<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        content
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.vCard.opacity(0.4))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.vBorder, lineWidth: 0.5))
            .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private struct MetricRow: View {
    let token: String
    let label: String
    let hint: String
    let value: String
    var body: some View {
        HStack(spacing: 10) {
            Text(token)
                .font(.system(size: 9, weight: .medium))
                .tracking(0.5)
                .foregroundStyle(Color.vMutedForeground)
                .frame(width: 26, height: 26)
                .background(Color.vBackground)
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vForeground)
                Text(hint)
                    .font(.system(size: 10))
                    .foregroundStyle(Color.vMutedForeground.opacity(0.75))
            }
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Color.vForeground)
                .monospacedDigit()
        }
        .padding(.vertical, 8)
    }
}

private struct ProgressBar: View {
    let progress: Double
    let tint: Color
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.vBorder)
                Capsule()
                    .fill(tint)
                    .frame(width: max(0, min(1, progress)) * geo.size.width)
                    .animation(.easeInOut(duration: 0.4), value: progress)
            }
        }
    }
}

private struct GoalRow: View {
    let label: String
    let display: String
    let progress: Double
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.vForeground.opacity(0.85))
                Spacer()
                Text(display)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(Color.vForeground)
                    .monospacedDigit()
            }
            ProgressBar(progress: progress, tint: Color.vForeground.opacity(0.7))
                .frame(height: 3)
        }
    }
}

private struct Stat: View {
    let label: String
    let value: String
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(.system(size: 9, weight: .medium))
                .tracking(1.2)
                .foregroundStyle(Color.vMutedForeground.opacity(0.75))
            Text(value)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color.vForeground)
                .monospacedDigit()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct TimelineRow: View {
    let event: TimelineEvent
    var body: some View {
        HStack(spacing: 10) {
            Text(token)
                .font(.system(size: 9, weight: .medium))
                .foregroundStyle(Color.vMutedForeground)
                .frame(width: 26, height: 26)
                .background(Color.vBackground)
                .clipShape(Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(event.label)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vForeground)
                Text(event.value)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.vMutedForeground)
                    .lineLimit(1)
            }
            Spacer()
            Text(event.time)
                .font(.system(size: 10))
                .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                .monospacedDigit()
        }
    }
    private var token: String {
        switch event.type {
        case .glucose: return "G"
        case .meal: return "M"
        case .activity: return "A"
        case .sleep: return "S"
        case .medication: return "Rx"
        }
    }
}

private let chartSamples = 64

private func resampleValues(_ values: [Double], to target: Int) -> [Double] {
    guard !values.isEmpty else { return Array(repeating: 0, count: target) }
    if values.count == 1 { return Array(repeating: values[0], count: target) }
    if values.count == target { return values }
    let last = values.count - 1
    return (0..<target).map { i in
        let t = Double(i) / Double(target - 1) * Double(last)
        let lo = Int(floor(t)), hi = min(last, lo + 1)
        let frac = t - Double(lo)
        return values[lo] * (1 - frac) + values[hi] * frac
    }
}

private struct AnimatableValues: VectorArithmetic {
    var values: [Double]
    static var zero: AnimatableValues { AnimatableValues(values: Array(repeating: 0, count: chartSamples)) }
    var magnitudeSquared: Double { values.reduce(0) { $0 + $1 * $1 } }
    mutating func scale(by rhs: Double) { values = values.map { $0 * rhs } }
    static func + (lhs: AnimatableValues, rhs: AnimatableValues) -> AnimatableValues {
        let n = max(lhs.values.count, rhs.values.count)
        let l = lhs.values + Array(repeating: 0.0, count: n - lhs.values.count)
        let r = rhs.values + Array(repeating: 0.0, count: n - rhs.values.count)
        return AnimatableValues(values: zip(l, r).map(+))
    }
    static func - (lhs: AnimatableValues, rhs: AnimatableValues) -> AnimatableValues {
        let n = max(lhs.values.count, rhs.values.count)
        let l = lhs.values + Array(repeating: 0.0, count: n - lhs.values.count)
        let r = rhs.values + Array(repeating: 0.0, count: n - rhs.values.count)
        return AnimatableValues(values: zip(l, r).map(-))
    }
    static func += (lhs: inout AnimatableValues, rhs: AnimatableValues) { lhs = lhs + rhs }
    static func -= (lhs: inout AnimatableValues, rhs: AnimatableValues) { lhs = lhs - rhs }
}

private struct TrendShape: Shape {
    var samples: AnimatableValues
    var fill: Bool

    var animatableData: AnimatableValues {
        get { samples }
        set { samples = newValue }
    }

    func path(in rect: CGRect) -> Path {
        var p = Path()
        let v = samples.values
        guard v.count > 1 else { return p }
        let minV = v.min() ?? 0
        let maxV = v.max() ?? 1
        let span = max(maxV - minV, 1)
        let stepX = rect.width / CGFloat(v.count - 1)
        for (i, value) in v.enumerated() {
            let x = CGFloat(i) * stepX
            let y = (1 - CGFloat((value - minV) / span)) * rect.height
            if i == 0 { p.move(to: CGPoint(x: x, y: y)) } else {
                let prevX = CGFloat(i - 1) * stepX
                let prevY = (1 - CGFloat((v[i - 1] - minV) / span)) * rect.height
                let cx = (prevX + x) / 2
                p.addCurve(to: CGPoint(x: x, y: y), control1: CGPoint(x: cx, y: prevY), control2: CGPoint(x: cx, y: y))
            }
        }
        if fill {
            p.addLine(to: CGPoint(x: rect.width, y: rect.height))
            p.addLine(to: CGPoint(x: 0, y: rect.height))
            p.closeSubpath()
        }
        return p
    }
}

struct StabilityTrendChart: View {
    let values: [Double]

    private var samples: AnimatableValues {
        AnimatableValues(values: resampleValues(values, to: chartSamples))
    }

    var body: some View {
        ZStack {
            TrendShape(samples: samples, fill: true)
                .fill(LinearGradient(
                    stops: [
                        .init(color: Color.vPrimary.opacity(0.18), location: 0),
                        .init(color: Color.vPrimary.opacity(0), location: 1),
                    ],
                    startPoint: .top, endPoint: .bottom
                ))
            TrendShape(samples: samples, fill: false)
                .stroke(Color.vPrimary, style: StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round))
        }
        .animation(.easeInOut(duration: 0.55), value: values)
    }
}
