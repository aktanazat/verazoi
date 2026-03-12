import SwiftUI

enum LogTab: String, CaseIterable {
    case glucose = "Glucose"
    case meals = "Meals"
    case activity = "Activity"
    case sleep = "Sleep"
    case medications = "Meds"
}

struct LogTabView: View {
    @State private var selectedTab: LogTab = .glucose

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(LogTab.allCases, id: \.self) { tab in
                        Button {
                            selectedTab = tab
                        } label: {
                            Text(tab.rawValue)
                                .font(.system(size: 12, weight: .medium))
                                .tracking(0.3)
                                .foregroundStyle(selectedTab == tab ? Color.vForeground : Color.vMutedForeground.opacity(0.7))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(selectedTab == tab ? Color.vPrimary.opacity(0.1) : Color.clear)
                                .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
            .padding(.vertical, 12)

            switch selectedTab {
            case .glucose: GlucoseLogView()
            case .meals: MealsLogView()
            case .activity: ActivityLogView()
            case .sleep: SleepLogView()
            case .medications: MedicationLogView()
            }
        }
        .background(Color.vBackground)
    }
}
