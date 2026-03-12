import SwiftUI
import Charts

private let periods = [7, 30, 90]

struct TrendsView: View {
    @Environment(AppState.self) private var state
    @State private var selectedDays = 7

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Trends")
                    .padding(.top, 4)

                Text("Glucose & Stability")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 12)

                HStack(spacing: 8) {
                    ForEach(periods, id: \.self) { d in
                        VPillButton(title: "\(d)d", isSelected: selectedDays == d) {
                            selectedDays = d
                            Task { await state.fetchTrends(days: d) }
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(.top, 16)

                VStack(spacing: 16) {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Glucose Trend")

                            if state.glucoseTrend.isEmpty {
                                Text("No trend data available")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 24)
                            } else {
                                Chart(state.glucoseTrend) { point in
                                    AreaMark(
                                        x: .value("Date", point.date),
                                        yStart: .value("Min", point.min),
                                        yEnd: .value("Max", point.max)
                                    )
                                    .foregroundStyle(Color.vPrimary.opacity(0.1))

                                    LineMark(
                                        x: .value("Date", point.date),
                                        y: .value("Avg", point.avg)
                                    )
                                    .foregroundStyle(Color.vPrimary)
                                    .lineStyle(StrokeStyle(lineWidth: 1.5))
                                }
                                .chartXAxis {
                                    AxisMarks(values: .automatic) { _ in
                                        AxisValueLabel()
                                            .font(.system(size: 10))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }
                                }
                                .chartYAxis {
                                    AxisMarks(values: .automatic) { _ in
                                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                                            .foregroundStyle(Color.vBorder)
                                        AxisValueLabel()
                                            .font(.system(size: 10))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }
                                }
                                .frame(height: 200)
                                .padding(.top, 16)
                            }
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Stability Score")

                            if state.stabilityTrend.isEmpty {
                                Text("No stability data available")
                                    .font(.system(size: 13))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 24)
                            } else {
                                Chart(state.stabilityTrend) { point in
                                    LineMark(
                                        x: .value("Date", point.date),
                                        y: .value("Score", point.score)
                                    )
                                    .foregroundStyle(Color.vForeground)
                                    .lineStyle(StrokeStyle(lineWidth: 1.5))

                                    PointMark(
                                        x: .value("Date", point.date),
                                        y: .value("Score", point.score)
                                    )
                                    .foregroundStyle(Color.vForeground)
                                    .symbolSize(16)
                                }
                                .chartYScale(domain: 0...100)
                                .chartXAxis {
                                    AxisMarks(values: .automatic) { _ in
                                        AxisValueLabel()
                                            .font(.system(size: 10))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }
                                }
                                .chartYAxis {
                                    AxisMarks(values: .automatic) { _ in
                                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                                            .foregroundStyle(Color.vBorder)
                                        AxisValueLabel()
                                            .font(.system(size: 10))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }
                                }
                                .frame(height: 200)
                                .padding(.top, 16)
                            }
                        }
                    }
                }
                .padding(.top, 24)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Color.vBackground)
        .task { await state.fetchTrends(days: selectedDays) }
    }
}
