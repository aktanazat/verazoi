import SwiftUI

struct InsightView: View {
    @Environment(AppState.self) private var state
    @State private var isGenerating = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "AI Insights")
                    .padding(.top, 4)

                Text("Weekly Analysis")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 12)

                VCard {
                    VStack(alignment: .leading, spacing: 0) {
                        if let insight = state.weeklyInsight {
                            HStack {
                                VLabelText(text: "Week of \(insight.weekStart)")
                                Spacer()
                                Text(insight.generatedAt)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                            }

                            Text(insight.summary)
                                .font(.system(size: 13))
                                .lineSpacing(4)
                                .foregroundStyle(Color.vForeground.opacity(0.8))
                                .padding(.top, 16)

                            Button {
                                isGenerating = true
                                Task {
                                    await state.generateInsight()
                                    isGenerating = false
                                }
                            } label: {
                                Text(isGenerating ? "Generating..." : "Regenerate")
                                    .font(.system(size: 12, weight: .medium))
                                    .tracking(0.4)
                                    .foregroundStyle(Color.vMutedForeground)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 0)
                                            .stroke(Color.vBorder, lineWidth: 0.5)
                                    )
                            }
                            .disabled(isGenerating)
                            .padding(.top, 20)
                        } else {
                            VStack(spacing: 6) {
                                Text("No insight generated yet")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                Text("Generate a weekly analysis of your metabolic patterns.")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 24)

                            Button {
                                isGenerating = true
                                Task {
                                    await state.generateInsight()
                                    isGenerating = false
                                }
                            } label: {
                                Text(isGenerating ? "Generating..." : "Generate insight")
                                    .font(.system(size: 12, weight: .medium))
                                    .tracking(0.4)
                                    .foregroundStyle(Color.vBackground)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(isGenerating ? Color.vForeground.opacity(0.3) : Color.vForeground)
                            }
                            .disabled(isGenerating)
                        }
                    }
                }
                .padding(.top, 24)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Color.vBackground)
        .task { await state.fetchInsight() }
    }
}
