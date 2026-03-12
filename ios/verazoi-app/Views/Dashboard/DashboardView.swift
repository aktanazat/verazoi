import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    VLabelText(text: "Overview")
                        .padding(.top, 4)

                    Text("Dashboard")
                        .font(.vSerif(28))
                        .foregroundStyle(Color.vForeground)
                        .padding(.top, 12)

                    VStack(spacing: 16) {
                        StabilityScoreView(score: state.stabilityScore, readings: state.glucoseReadings)
                        SpikeRiskView()
                        GoalProgressView()
                        DailyTimelineView(events: state.timeline)

                        NavigationLink { TrendsView() } label: {
                            DashboardNavCard(title: "Trends", subtitle: "Glucose & stability over time", icon: "chart.xyaxis.line")
                        }

                        NavigationLink { FoodImpactView() } label: {
                            DashboardNavCard(title: "Food Impact", subtitle: "How foods affect your glucose", icon: "fork.knife")
                        }

                        NavigationLink { InsightView() } label: {
                            DashboardNavCard(title: "AI Insights", subtitle: "Weekly metabolic analysis", icon: "sparkles")
                        }
                    }
                    .padding(.top, 24)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
            .background(Color.vBackground)
        }
    }
}

private struct DashboardNavCard: View {
    let title: String
    let subtitle: String
    let icon: String

    var body: some View {
        VCard {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .light))
                    .foregroundStyle(Color.vPrimary)
                    .frame(width: 28)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Color.vForeground)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vMutedForeground)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .light))
                    .foregroundStyle(Color.vMutedForeground.opacity(0.6))
            }
        }
    }
}
