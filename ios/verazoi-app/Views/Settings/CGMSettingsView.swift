import SwiftUI

struct CGMSettingsView: View {
    @State private var provider = "dexcom"
    @State private var username = ""
    @State private var password = ""
    @State private var connecting = false
    @State private var syncing = false
    @State private var connected = false
    @State private var error: String?
    @State private var lastSync: String?

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    VLabelText(text: "CGM Device")
                    Spacer()
                    if connected {
                        Text("Connected")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vPrimary)
                    }
                }

                if connected {
                    if let lastSync {
                        Text("Last sync: \(lastSync)")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground)
                            .padding(.top, 8)
                    }

                    HStack(spacing: 8) {
                        Button {
                            syncCGM()
                        } label: {
                            Text(syncing ? "Syncing..." : "Sync now")
                                .font(.system(size: 12, weight: .medium))
                                .tracking(0.4)
                                .foregroundStyle(Color.vBackground)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(Color.vForeground)
                        }
                        .disabled(syncing)

                        Button {
                            disconnect()
                        } label: {
                            Text("Disconnect")
                                .font(.system(size: 12, weight: .medium))
                                .tracking(0.4)
                                .foregroundStyle(Color.vMutedForeground)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))
                        }
                    }
                    .padding(.top, 16)
                } else {
                    Text("Import glucose readings directly from your CGM.")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vMutedForeground)
                        .lineSpacing(4)
                        .padding(.top, 12)

                    HStack(spacing: 8) {
                        VPillButton(title: "Dexcom", isSelected: provider == "dexcom") { provider = "dexcom" }
                        VPillButton(title: "Libre", isSelected: provider == "libre") { provider = "libre" }
                    }
                    .padding(.top, 16)

                    TextField("Username", text: $username)
                        .font(.system(size: 13))
                        .textContentType(.username)
                        .autocapitalization(.none)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))
                        .padding(.top, 12)

                    SecureField("Password", text: $password)
                        .font(.system(size: 13))
                        .textContentType(.password)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))
                        .padding(.top, 8)

                    if let error {
                        Text(error)
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vAmber)
                            .padding(.top, 8)
                    }

                    Button {
                        connectCGM()
                    } label: {
                        Text(connecting ? "Connecting..." : "Connect")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(username.isEmpty || password.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                    }
                    .disabled(username.isEmpty || password.isEmpty || connecting)
                    .padding(.top, 16)
                }
            }
        }
        .task { await checkStatus() }
    }

    private func connectCGM() {
        connecting = true
        error = nil
        Task {
            do {
                try await APIClient.shared.connectCGM(provider: provider, username: username, password: password)
                connected = true
                password = ""
                _ = try? await APIClient.shared.syncCGM()
                await checkStatus()
            } catch let e as APIError {
                if case .httpError(_, let detail) = e { error = detail }
                else { error = "Connection failed." }
            } catch {
                self.error = "Connection failed."
            }
            connecting = false
        }
    }

    private func syncCGM() {
        syncing = true
        Task {
            _ = try? await APIClient.shared.syncCGM()
            await checkStatus()
            syncing = false
        }
    }

    private func disconnect() {
        Task {
            _ = try? await APIClient.shared.disconnectCGM()
            connected = false
            lastSync = nil
        }
    }

    private func checkStatus() async {
        let statuses = (try? await APIClient.shared.getCGMStatus()) ?? []
        if let active = statuses.first(where: { $0.active }) {
            connected = true
            lastSync = active.lastSync
        }
    }
}
