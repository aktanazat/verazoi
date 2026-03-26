import SwiftUI

struct SpikeRiskView: View {
    @Environment(AppState.self) private var state
    @State private var expandedFactor: String?

    private var riskPercent: Int {
        if let result = state.stabilityResult {
            return Int((result.spikeRisk * 100).rounded())
        }
        return 0
    }

    private var riskLevel: String {
        if riskPercent >= 60 { return "Elevated" }
        if riskPercent >= 40 { return "Moderate" }
        return "Low"
    }

    private var hasData: Bool {
        state.stabilityResult != nil
    }

    private var displayFactors: [DisplayFactor] {
        if let result = state.stabilityResult, !result.spikeFactors.isEmpty {
            return result.spikeFactors.map { DisplayFactor(label: $0.label, impact: $0.impact, explanation: $0.explanation) }
        }
        return []
    }

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        VLabelText(text: "Spike Risk")
                        Text("Next 4 hours")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                    }
                    Spacer()
                    if hasData {
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 13, weight: .regular))
                                .foregroundStyle(Color.vAmber.opacity(0.7))
                                .accessibilityHidden(true)
                            Text(riskLevel)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(Color.vForeground)
                        }
                        .accessibilityElement(children: .combine)
                        .accessibilityLabel("Risk level: \(riskLevel)")
                    }
                }

                if !hasData {
                    VStack(spacing: 6) {
                        Text("Waiting for data")
                            .font(.system(size: 13))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                        Text("Log glucose readings and meals to see your spike risk prediction.")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                } else {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(
                            "Based on your patterns, there's a \(Text("\(riskPercent)% chance").fontWeight(.medium).foregroundStyle(Color.vForeground)) of a glucose spike above 140 mg/dL in the next 4 hours."
                        )
                        .foregroundStyle(Color.vForeground.opacity(0.8))
                    }
                    .font(.system(size: 13))
                    .lineSpacing(4)
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.vSecondary.opacity(0.5))
                    .overlay(
                        RoundedRectangle(cornerRadius: 0)
                            .stroke(Color.vBorder, lineWidth: 0.5)
                    )
                    .padding(.top, 20)

                    if !displayFactors.isEmpty {
                        VLabelText(text: "Contributing Factors")
                            .padding(.top, 24)

                        VStack(spacing: 0) {
                            ForEach(displayFactors) { factor in
                                FactorRow(
                                    factor: factor,
                                    isExpanded: expandedFactor == factor.id,
                                    isLast: factor.id == displayFactors.last?.id
                                ) {
                                    withAnimation(.easeInOut(duration: 0.2)) {
                                        expandedFactor = expandedFactor == factor.id ? nil : factor.id
                                    }
                                }
                            }
                        }
                        .padding(.top, 16)
                    }

                    if let result = state.stabilityResult, let suggestion = result.suggestion {
                        Divider()
                            .foregroundStyle(Color.vBorder)
                            .padding(.top, 20)

                        VLabelText(text: "Suggestion")
                            .padding(.top, 20)

                        Text(suggestion)
                            .font(.system(size: 13))
                            .lineSpacing(4)
                            .foregroundStyle(Color.vForeground.opacity(0.8))
                            .padding(.top, 12)
                    }
                }
            }
        }
    }
}

private struct DisplayFactor: Identifiable {
    var id: String { label }
    let label: String
    let impact: String
    let explanation: String
}

private struct FactorRow: View {
    let factor: DisplayFactor
    let isExpanded: Bool
    let isLast: Bool
    let onTap: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: onTap) {
                HStack(spacing: 12) {
                    Text(factor.impact.uppercased())
                        .font(.system(size: 10, weight: .medium))
                        .tracking(1)
                        .foregroundStyle(factor.impact == "high" ? Color.vAmber : Color.vForeground.opacity(0.7))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(factor.impact == "high" ? Color.vAmber.opacity(0.1) : Color.vForeground.opacity(0.05))

                    Text(factor.label)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vForeground)
                        .multilineTextAlignment(.leading)

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .light))
                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                        .rotationEffect(.degrees(isExpanded ? 90 : 0))
                }
                .padding(.vertical, 16)
            }

            if isExpanded {
                Text(factor.explanation)
                    .font(.system(size: 13))
                    .lineSpacing(4)
                    .foregroundStyle(Color.vMutedForeground)
                    .padding(.leading, 72)
                    .padding(.bottom, 16)
            }

            if !isLast {
                Divider().foregroundStyle(Color.vBorder)
            }
        }
    }
}
