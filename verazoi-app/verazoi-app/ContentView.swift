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

    var body: some View {
        Group {
            if authState.isAuthenticated {
                TabView(selection: $selectedTab) {
                    Tab("Dashboard", systemImage: "chart.bar", value: .dashboard) {
                        DashboardView()
                    }

                    Tab("Log", systemImage: "square.and.pencil", value: .log) {
                        LogTabView()
                    }

                    Tab("Settings", systemImage: "gearshape", value: .settings) {
                        SettingsView()
                    }
                }
                .tint(Color.vPrimary)
            } else {
                LoginView()
            }
        }
        .environment(appState)
        .environment(wearableState)
        .environment(authState)
        .onAppear {
            appState.wearable = wearableState
        }
        .onChange(of: authState.isAuthenticated) {
            if authState.isAuthenticated {
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
