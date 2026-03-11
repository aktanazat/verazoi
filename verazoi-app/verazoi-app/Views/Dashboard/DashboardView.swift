import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Overview")
                    .padding(.top, 4)

                Text("Dashboard")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 12)

                VStack(spacing: 16) {
                    StabilityScoreView(
                        score: state.stabilityScore,
                        readings: state.glucoseReadings
                    )
                    SpikeRiskView()
                    DailyTimelineView(events: state.timeline)
                }
                .padding(.top, 24)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Color.vBackground)
    }
}
