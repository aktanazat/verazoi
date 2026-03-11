import SwiftUI

private let qualities = ["poor", "fair", "good", "great"]

struct SleepLogView: View {
    @Environment(AppState.self) private var state
    @State private var sleepHours = ""
    @State private var sleepQuality = "good"
    @State private var saved = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let hours = Double(sleepHours) else { return }
                        state.addSleep(hours: hours, quality: sleepQuality)
                        saved = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            saved = false
                            sleepHours = ""
                        }
                    } label: {
                        Text(saved ? "Saved" : "Save sleep")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(sleepHours.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                    }
                    .disabled(sleepHours.isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

                VStack(spacing: 16) {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Hours slept")

                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                TextField("0", text: $sleepHours)
                                    .keyboardType(.decimalPad)
                                    .font(.vSerif(32))
                                    .foregroundStyle(Color.vForeground)
                                Text("hours")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.vMutedForeground)
                            }
                            .padding(.top, 8)

                            VLabelText(text: "Quality")
                                .padding(.top, 20)

                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                                ForEach(qualities, id: \.self) { q in
                                    VPillButton(title: q.capitalized, isSelected: sleepQuality == q) {
                                        sleepQuality = q
                                    }
                                }
                            }
                            .padding(.top, 8)
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            let sleepEvents = state.timeline.filter { $0.type == .sleep }

                            HStack {
                                VLabelText(text: "Recent sleep")
                                Spacer()
                                Text("\(sleepEvents.count) logged")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                            }

                            if sleepEvents.isEmpty {
                                VStack(spacing: 6) {
                                    Text("No sleep logged")
                                        .font(.system(size: 13))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    Text("Log your sleep to track rest and recovery.")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 24)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(sleepEvents.enumerated()), id: \.element.id) { index, event in
                                        HStack {
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(event.label)
                                                    .font(.system(size: 13))
                                                    .foregroundStyle(Color.vForeground)
                                                Text(event.value)
                                                    .font(.system(size: 12))
                                                    .foregroundStyle(Color.vMutedForeground)
                                            }
                                            Spacer()
                                            Text(event.time)
                                                .font(.system(size: 11))
                                                .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                                        }
                                        .padding(.vertical, 12)

                                        if index < sleepEvents.count - 1 {
                                            Divider().foregroundStyle(Color.vBorder)
                                        }
                                    }
                                }
                                .padding(.top, 16)
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
        }
    }
}
