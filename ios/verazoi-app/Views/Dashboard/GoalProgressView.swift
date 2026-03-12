import SwiftUI

struct GoalProgressView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Goal Progress")

                VStack(spacing: 16) {
                    ProgressRow(
                        label: "Glucose in range",
                        current: "\(Int(state.goalProgress.glucoseInRangePct))%",
                        fraction: state.goalProgress.glucoseInRangePct / 100
                    )
                    ProgressRow(
                        label: "Steps",
                        current: "\(state.goalProgress.stepsToday) / \(state.goalProgress.stepsTarget)",
                        fraction: state.goalProgress.stepsTarget > 0
                            ? Double(state.goalProgress.stepsToday) / Double(state.goalProgress.stepsTarget)
                            : 0
                    )
                    ProgressRow(
                        label: "Sleep",
                        current: "\(String(format: "%.1f", state.goalProgress.sleepLast)) / \(String(format: "%.0f", state.goalProgress.sleepTarget)) hrs",
                        fraction: state.goalProgress.sleepTarget > 0
                            ? state.goalProgress.sleepLast / state.goalProgress.sleepTarget
                            : 0
                    )
                }
                .padding(.top, 16)
            }
        }
    }
}

private struct ProgressRow: View {
    let label: String
    let current: String
    let fraction: Double

    private var clampedFraction: Double {
        min(max(fraction, 0), 1)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(label)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vForeground)
                Spacer()
                Text(current)
                    .font(.system(size: 12))
                    .foregroundStyle(Color.vMutedForeground)
                    .monospacedDigit()
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.vBorder)
                        .frame(height: 4)

                    Rectangle()
                        .fill(Color.vPrimary)
                        .frame(width: geo.size.width * clampedFraction, height: 4)
                }
            }
            .frame(height: 4)
        }
    }
}
