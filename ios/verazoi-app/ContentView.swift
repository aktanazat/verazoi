import SwiftUI

enum AppTab: String {
    case dashboard = "Dashboard"
    case log = "Log"
    case settings = "Settings"
}

struct ContentView: View {
    @State private var selectedTab: AppTab = .dashboard
    @State private var appState = AppState()
    @State private var wearableState = WearableState()
    @State private var authState = AuthState()
    @AppStorage("verazoi_onboarding_complete") private var onboardingComplete = false
    @AppStorage("verazoi_design_variant") private var variantRaw = "mercury"

    private var design: DesignVariant {
        DesignVariant(rawValue: variantRaw) ?? .mercury
    }

    var body: some View {
        Group {
            if !onboardingComplete {
                OnboardingView {
                    withAnimation(.easeInOut(duration: 0.4)) {
                        onboardingComplete = true
                    }
                }
            } else if authState.isAuthenticated {
                TabView(selection: $selectedTab) {
                    Tab("Dashboard", systemImage: design.useIconTabs ? "house" : "chart.bar", value: .dashboard) {
                        if design == .mercury {
                            MercuryDashboardView()
                        } else {
                            DashboardView()
                        }
                    }

                    Tab("Log", systemImage: design.useIconTabs ? "plus.circle.fill" : "square.and.pencil", value: .log) {
                        LogTabView()
                    }

                    Tab("Settings", systemImage: design.useIconTabs ? "gearshape.fill" : "gearshape", value: .settings) {
                        SettingsView()
                    }
                }
                .tint(Color.vPrimary)
            } else {
                LoginView()
            }
        }
        .environment(\.design, design)
        .environment(appState)
        .environment(wearableState)
        .environment(authState)
        .task {
            appState.wearable = wearableState
            #if DEBUG
            if !authState.isAuthenticated && CommandLine.arguments.contains("-demo") {
                wearableState.applyDemoData()
                authState.applyDemoSession()
            }
            #endif
        }
        .onChange(of: authState.isAuthenticated) {
            if authState.isAuthenticated {
                #if DEBUG
                if authState.token == "demo-token" {
                    appState.applyDemoData(wearable: wearableState)
                    return
                }
                #endif
                Task { await appState.fetchFromBackend() }
            }
        }
        .onChange(of: wearableState.lastSyncDate) {
            appState.recalcScore()
            appState.syncWearableToBackend()
        }
    }
}

#Preview {
    ContentView()
}
