import SwiftUI

struct CGMSettingsView: View {
    @Environment(WearableState.self) private var wearable

    private var glucoseReadingsReady: Int {
        wearable.latestGlucoseReadings.count
    }

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    VLabelText(text: "Glucose Import")
                    Spacer()
                    if wearable.connectedProvider != nil {
                        Text("Apple Health")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vPrimary)
                    }
                }

                Text("Verazoi imports CGM glucose through Apple Health. Direct Dexcom and Libre credential sign-in is not available in the app.")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vMutedForeground)
                    .lineSpacing(4)
                    .padding(.top, 12)

                if let provider = wearable.connectedProvider {
                    Text("Connected through \(provider.rawValue). If your CGM app writes glucose into Health, sync your wearable to import those readings without sharing CGM credentials.")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vPrimary)
                        .lineSpacing(4)
                        .padding(.top, 8)

                    if let lastSync = wearable.lastSyncDate {
                        Text("Last Apple Health sync: \(lastSync.formatted(date: .omitted, time: .shortened))")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground)
                            .padding(.top, 8)
                    }

                    Text(
                        glucoseReadingsReady > 0
                            ? "\(glucoseReadingsReady) glucose readings ready to sync"
                            : "No glucose readings found in Apple Health yet."
                    )
                    .font(.system(size: 12))
                    .foregroundStyle(glucoseReadingsReady > 0 ? Color.vForeground : Color.vMutedForeground)
                    .padding(.top, 8)

                    if let error = wearable.connectionError {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vAmber)
                            .lineSpacing(3)
                            .padding(.top, 8)
                    }

                    Button {
                        wearable.syncNow()
                    } label: {
                        Text(wearable.connectionStatus == .syncing ? "Syncing..." : "Sync Apple Health now")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color.vForeground)
                    }
                    .disabled(wearable.connectionStatus == .syncing)
                    .padding(.top, 16)
                } else {
                    Text("Connect Apple Health in Wearable Device below, then sync once to import glucose that your CGM app already writes into Health.")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vMutedForeground)
                        .lineSpacing(4)
                        .padding(.top, 8)
                }
            }
        }
    }
}
