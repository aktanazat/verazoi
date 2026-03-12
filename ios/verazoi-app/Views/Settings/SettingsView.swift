import SwiftUI

struct SettingsView: View {
    @Environment(WearableState.self) private var wearable
    @Environment(AuthState.self) private var auth

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Settings")
                    .padding(.top, 4)

                Text("Settings")
                    .font(.vSerif(28))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 12)

                VStack(spacing: 16) {
                    AccountCard()
                    GoalsSettingsCard()
                    ExportCard()
                    WearableConnectionCard()
                    if wearable.connectedProvider != nil {
                        SyncSettingsCard()
                        WearableDataCard()
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

private struct AccountCard: View {
    @Environment(AuthState.self) private var auth

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Account")

                if let email = auth.email {
                    Text(email)
                        .font(.system(size: 14))
                        .foregroundStyle(Color.vForeground)
                        .padding(.top, 12)
                }

                Button {
                    auth.logout()
                } label: {
                    Text("Sign out")
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
                .padding(.top, 16)
            }
        }
    }
}

private struct WearableConnectionCard: View {
    @Environment(WearableState.self) private var wearable
    @State private var showProviderPicker = false

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        VLabelText(text: "Wearable Device")
                        Text(wearable.connectionStatus.rawValue)
                            .font(.system(size: 12))
                            .foregroundStyle(
                                wearable.connectionStatus == .connected
                                    ? Color.vPrimary
                                    : Color.vMutedForeground.opacity(0.8)
                            )
                    }
                    Spacer()
                    if let provider = wearable.connectedProvider {
                        Image(systemName: provider.systemImage)
                            .font(.system(size: 20, weight: .light))
                            .foregroundStyle(Color.vPrimary)
                    }
                }

                if let provider = wearable.connectedProvider {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(provider.rawValue)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundStyle(Color.vForeground)
                            Text(provider.description)
                                .font(.system(size: 12))
                                .foregroundStyle(Color.vMutedForeground)
                                .lineSpacing(2)
                        }
                    }
                    .padding(.top, 16)

                    if let error = wearable.connectionError {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vAmber)
                            .lineSpacing(2)
                            .padding(.top, 12)
                    }

                    VLabelText(text: "Sync capabilities")
                        .padding(.top, 20)

                    FlowLayout(spacing: 6) {
                        ForEach(provider.syncCapabilities, id: \.rawValue) { capability in
                            Text(capability.rawValue)
                                .font(.system(size: 11, weight: .medium))
                                .tracking(0.2)
                                .foregroundStyle(Color.vPrimary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(Color.vPrimary.opacity(0.08))
                        }
                    }
                    .padding(.top, 8)

                    Button {
                        wearable.disconnect()
                    } label: {
                        Text("Disconnect")
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
                    .padding(.top, 20)
                } else {
                    Text("Connect a wearable to auto-sync activity, sleep, and heart rate data into your stability score.")
                        .font(.system(size: 13))
                        .lineSpacing(4)
                        .foregroundStyle(Color.vMutedForeground)
                        .padding(.top, 16)

                    if let error = wearable.connectionError {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vAmber)
                            .lineSpacing(2)
                            .padding(.top, 12)
                    }

                    VStack(spacing: 8) {
                        ForEach(WearableProvider.allCases) { provider in
                            Button {
                                wearable.connect(to: provider)
                            } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: provider.systemImage)
                                        .font(.system(size: 16, weight: .light))
                                        .foregroundStyle(Color.vMutedForeground)
                                        .frame(width: 28)

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(provider.rawValue)
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundStyle(Color.vForeground)
                                        Text(provider.description)
                                            .font(.system(size: 11))
                                            .foregroundStyle(Color.vMutedForeground)
                                            .lineLimit(1)
                                    }

                                    Spacer()

                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 12, weight: .light))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                }
                                .padding(.vertical, 14)
                                .padding(.horizontal, 16)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 0)
                                        .stroke(Color.vBorder, lineWidth: 0.5)
                                )
                            }
                        }
                    }
                    .padding(.top, 16)
                }
            }
        }
    }
}

private struct SyncSettingsCard: View {
    @Environment(WearableState.self) private var wearable

    var body: some View {
        @Bindable var wearable = wearable

        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Sync Settings")

                HStack {
                    Text("Auto-sync")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vForeground)
                    Spacer()
                    Toggle("", isOn: $wearable.autoSync)
                        .tint(Color.vPrimary)
                        .labelsHidden()
                }
                .padding(.top, 16)

                if wearable.autoSync {
                    VLabelText(text: "Sync interval")
                        .padding(.top, 16)

                    HStack(spacing: 8) {
                        ForEach(SyncInterval.allCases, id: \.self) { interval in
                            VPillButton(
                                title: interval.rawValue,
                                isSelected: wearable.syncInterval == interval
                            ) {
                                wearable.syncInterval = interval
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.top, 8)
                }

                if let lastSync = wearable.lastSyncDate {
                    HStack {
                        Text("Last synced")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground)
                        Spacer()
                        Text(lastSync.formatted(date: .omitted, time: .shortened))
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vForeground)
                    }
                    .padding(.top, 16)
                }

                Button {
                    wearable.syncNow()
                } label: {
                    Text(wearable.connectionStatus == .syncing ? "Syncing..." : "Sync now")
                        .font(.system(size: 12, weight: .medium))
                        .tracking(0.4)
                        .foregroundStyle(Color.vBackground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.vForeground)
                }
                .disabled(wearable.connectionStatus == .syncing)
                .padding(.top, 16)
            }
        }
    }
}

private struct WearableDataCard: View {
    @Environment(WearableState.self) private var wearable

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Latest Wearable Data")

                VStack(spacing: 0) {
                    WearableMetricRow(label: "Heart rate", value: wearable.latestHeartRate.map { "\($0) bpm" } ?? "--", icon: "heart")
                    Divider().foregroundStyle(Color.vBorder)
                    WearableMetricRow(label: "Steps today", value: wearable.todaySteps.map { "\($0)" } ?? "--", icon: "figure.walk")
                    Divider().foregroundStyle(Color.vBorder)
                    WearableMetricRow(label: "Active minutes", value: wearable.todayActiveMinutes.map { "\($0) min" } ?? "--", icon: "flame")
                    Divider().foregroundStyle(Color.vBorder)
                    WearableMetricRow(label: "Last sleep", value: wearable.lastSleepHours.map { "\($0) hrs" } ?? "--", icon: "moon")
                    Divider().foregroundStyle(Color.vBorder)
                    WearableMetricRow(label: "Sleep quality", value: wearable.lastSleepQuality?.capitalized ?? "--", icon: "bed.double")
                }
                .padding(.top, 16)
            }
        }
    }
}

private struct WearableMetricRow: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .light))
                .foregroundStyle(Color.vMutedForeground)
                .frame(width: 20)
            Text(label)
                .font(.system(size: 13))
                .foregroundStyle(Color.vMutedForeground)
            Spacer()
            Text(value)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.vForeground)
                .monospacedDigit()
        }
        .padding(.vertical, 12)
    }
}
