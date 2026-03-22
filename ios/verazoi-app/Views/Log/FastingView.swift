import SwiftUI

struct FastingView: View {
    @State private var isActive = false
    @State private var startedAt: Date?
    @State private var targetHours: Double = 16
    @State private var elapsedHours: Double = 0
    @State private var history: [(id: String, started: String, elapsed: Double, target: Double?)] = []
    @State private var timer: Timer?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                VCard {
                    VStack(spacing: 0) {
                        VLabelText(text: "Fasting Timer")

                        if isActive, let startedAt {
                            Text(formatElapsed(elapsedHours))
                                .font(.vSerif(48))
                                .foregroundStyle(Color.vForeground)
                                .monospacedDigit()
                                .padding(.top, 20)

                            if targetHours > 0 {
                                let progress = min(elapsedHours / targetHours, 1.0)
                                GeometryReader { geo in
                                    ZStack(alignment: .leading) {
                                        Rectangle()
                                            .fill(Color.vBorder)
                                            .frame(height: 4)
                                        Rectangle()
                                            .fill(Color.vPrimary)
                                            .frame(width: geo.size.width * progress, height: 4)
                                    }
                                }
                                .frame(height: 4)
                                .padding(.top, 16)

                                Text("\(Int(targetHours))h target")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground)
                                    .padding(.top, 8)
                            }

                            Text("Started \(startedAt.formatted(date: .omitted, time: .shortened))")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.vMutedForeground)
                                .padding(.top, 4)

                            Button {
                                endFast()
                            } label: {
                                Text("End Fast")
                                    .font(.system(size: 12, weight: .medium))
                                    .tracking(0.4)
                                    .foregroundStyle(Color.vBackground)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(Color.vForeground)
                            }
                            .padding(.top, 20)
                        } else {
                            Text("Track how fasting affects your glucose levels.")
                                .font(.system(size: 13))
                                .foregroundStyle(Color.vMutedForeground)
                                .lineSpacing(4)
                                .padding(.top, 12)

                            VLabelText(text: "Target duration")
                                .padding(.top, 20)

                            HStack(spacing: 8) {
                                ForEach([12.0, 16.0, 18.0, 24.0], id: \.self) { hours in
                                    VPillButton(title: "\(Int(hours))h", isSelected: targetHours == hours) {
                                        targetHours = hours
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                            .padding(.top, 8)

                            Button {
                                startFast()
                            } label: {
                                Text("Start Fast")
                                    .font(.system(size: 12, weight: .medium))
                                    .tracking(0.4)
                                    .foregroundStyle(Color.vBackground)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(Color.vForeground)
                            }
                            .padding(.top, 20)
                        }
                    }
                }

                if !history.isEmpty {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "History")

                            VStack(spacing: 0) {
                                ForEach(history, id: \.id) { session in
                                    HStack {
                                        Text(formatElapsed(session.elapsed))
                                            .font(.system(size: 14, weight: .medium))
                                            .monospacedDigit()
                                            .foregroundStyle(Color.vForeground)
                                        if let target = session.target {
                                            Text("/ \(Int(target))h")
                                                .font(.system(size: 12))
                                                .foregroundStyle(Color.vMutedForeground)
                                        }
                                        Spacer()
                                        Text(session.started)
                                            .font(.system(size: 11))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }
                                    .padding(.vertical, 10)
                                    Divider().foregroundStyle(Color.vBorder)
                                }
                            }
                            .padding(.top, 12)
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .task { await loadState() }
    }

    private func formatElapsed(_ hours: Double) -> String {
        let h = Int(hours)
        let m = Int((hours - Double(h)) * 60)
        return String(format: "%d:%02d", h, m)
    }

    private func startFast() {
        Task {
            let session = try? await APIClient.shared.startFast(targetHours: targetHours)
            if session != nil {
                startedAt = Date()
                isActive = true
                startTimer()
            }
        }
    }

    private func endFast() {
        Task {
            _ = try? await APIClient.shared.endFast()
            isActive = false
            timer?.invalidate()
            timer = nil
            await loadState()
        }
    }

    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            if let s = startedAt {
                elapsedHours = Date().timeIntervalSince(s) / 3600
            }
        }
    }

    private func loadState() async {
        // Check for active fast
        if let active = try? await APIClient.shared.getActiveFast() {
            isActive = true
            elapsedHours = active.elapsedHours
            targetHours = active.targetHours ?? 16
            // Parse startedAt from ISO string
            let formatter = ISO8601DateFormatter()
            startedAt = formatter.date(from: active.startedAt)
            startTimer()
        }

        // Load history
        let sessions = (try? await APIClient.shared.fastingHistory()) ?? []
        history = sessions.map { s in
            (id: s.id, started: s.startedAt, elapsed: s.elapsedHours, target: s.targetHours)
        }
    }
}
