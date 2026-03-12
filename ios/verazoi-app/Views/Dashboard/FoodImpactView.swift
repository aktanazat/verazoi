import SwiftUI

struct FoodImpactView: View {
    @Environment(AppState.self) private var state

    private var maxDelta: Double {
        state.foodImpacts.map { abs($0.avgDelta) }.max() ?? 1
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Correlations")
                    .padding(.top, 4)

                Text("Food Impact")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 12)

                VCard {
                    VStack(alignment: .leading, spacing: 0) {
                        VLabelText(text: "Glucose response by food")

                        if state.foodImpacts.isEmpty {
                            VStack(spacing: 6) {
                                Text("No food impact data")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                Text("Log more meals to see how foods affect your glucose.")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 24)
                        } else {
                            VStack(spacing: 0) {
                                ForEach(Array(state.foodImpacts.enumerated()), id: \.element.id) { index, impact in
                                    FoodImpactRow(impact: impact, maxDelta: maxDelta)
                                        .padding(.vertical, 12)

                                    if index < state.foodImpacts.count - 1 {
                                        Divider().foregroundStyle(Color.vBorder)
                                    }
                                }
                            }
                            .padding(.top, 16)
                        }
                    }
                }
                .padding(.top, 24)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Color.vBackground)
        .task { await state.fetchFoodImpact() }
    }
}

private struct FoodImpactRow: View {
    let impact: FoodImpact
    let maxDelta: Double

    private var deltaText: String {
        let prefix = impact.avgDelta >= 0 ? "+" : ""
        return "\(prefix)\(Int(impact.avgDelta.rounded())) mg/dL"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(impact.food)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.vForeground)
                Spacer()
                Text(deltaText)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(impact.avgDelta >= 0 ? Color.vAmber : Color.vPrimary)
                    .monospacedDigit()
            }

            HStack {
                GeometryReader { geo in
                    Rectangle()
                        .fill(Color.vBorder)
                        .frame(height: 4)
                        .overlay(alignment: .leading) {
                            Rectangle()
                                .fill(impact.avgDelta >= 0 ? Color.vAmber.opacity(0.6) : Color.vPrimary.opacity(0.6))
                                .frame(width: geo.size.width * (abs(impact.avgDelta) / maxDelta), height: 4)
                        }
                }
                .frame(height: 4)

                Text("\(impact.occurrences)x")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.vMutedForeground)
                    .frame(width: 28, alignment: .trailing)
            }
        }
    }
}
