import SwiftUI

struct StabilityScoreView: View {
    let score: Int
    let readings: [GlucoseReading]

    @State private var displayed = 0
    @State private var animationProgress: CGFloat = 0
    @State private var countTask: Task<Void, Never>?

    private var label: String {
        if displayed >= 80 { return "Excellent" }
        if displayed >= 60 { return "Good" }
        if displayed >= 40 { return "Fair" }
        return "Needs attention"
    }

    private var metrics: (avg: Int, variability: Int, inRange: Int) {
        guard !readings.isEmpty else { return (0, 0, 0) }
        var sum = 0, minV = Int.max, maxV = Int.min, rangeCount = 0
        for r in readings {
            sum += r.value
            if r.value < minV { minV = r.value }
            if r.value > maxV { maxV = r.value }
            if r.value >= 70 && r.value <= 140 { rangeCount += 1 }
        }
        let avg = sum / readings.count
        let variability = readings.count > 1 ? maxV - minV : 0
        let inRange = Int((Double(rangeCount) / Double(readings.count) * 100).rounded())
        return (avg, variability, inRange)
    }

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        VLabelText(text: "Stability Score")
                        Text("Last 7 days")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                    }
                    Spacer()
                    Text(label)
                        .font(.system(size: 11))
                        .tracking(0.2)
                        .foregroundStyle(Color.vMutedForeground)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .overlay(
                            RoundedRectangle(cornerRadius: 0)
                                .stroke(Color.vBorder, lineWidth: 0.5)
                        )
                }

                HStack {
                    Spacer()
                    ZStack {
                        Circle()
                            .stroke(Color.vBorder, lineWidth: 2)
                            .frame(width: 200, height: 200)

                        Circle()
                            .trim(from: 0, to: animationProgress * CGFloat(score) / 100)
                            .stroke(Color.vForeground, style: StrokeStyle(lineWidth: 2, lineCap: .round))
                            .frame(width: 200, height: 200)
                            .rotationEffect(.degrees(-90))

                        Text("\(displayed)")
                            .font(.vSerif(52))
                            .foregroundStyle(Color.vForeground)
                            .monospacedDigit()
                            .offset(y: -2)
                    }
                    Spacer()
                }
                .padding(.top, 24)

                HStack(spacing: 0) {
                    MetricColumn(value: "\(metrics.avg)", label: "Avg glucose")
                    MetricColumn(value: "\(metrics.variability)", label: "Variability")
                    MetricColumn(value: "\(metrics.inRange)%", label: "In range")
                }
                .padding(.top, 24)
            }
        }
        .onAppear { startAnimation(delay: true) }
        .onChange(of: score) { startAnimation(delay: false) }
    }

    private func startAnimation(delay: Bool) {
        countTask?.cancel()
        displayed = 0
        animationProgress = 0
        withAnimation(.easeOut(duration: 1.2).delay(delay ? 0.3 : 0)) {
            animationProgress = 1
        }
        let target = score
        let step = max(1, target / 30)
        countTask = Task {
            try? await Task.sleep(for: .milliseconds(delay ? 300 : 0))
            var current = 0
            while current < target {
                if Task.isCancelled { return }
                current = min(current + step, target)
                displayed = current
                try? await Task.sleep(for: .milliseconds(30))
            }
        }
    }
}

private struct MetricColumn: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.vSerif(26))
                .foregroundStyle(Color.vForeground)
                .monospacedDigit()
            Text(label)
                .font(.system(size: 13))
                .foregroundStyle(Color.vMutedForeground)
        }
        .frame(maxWidth: .infinity)
    }
}
