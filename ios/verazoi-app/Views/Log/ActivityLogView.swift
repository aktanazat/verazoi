import SwiftUI

private let activityTypes = ["Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other"]
private let intensities = ["Light", "Moderate", "Intense"]

struct ActivityLogView: View {
    @Environment(AppState.self) private var state
    @State private var actType = "Walking"
    @State private var duration = ""
    @State private var intensity = "Moderate"
    @State private var saved = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let dur = Int(duration) else { return }
                        state.addActivity(activityType: actType, duration: dur, intensity: intensity)
                        saved = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            saved = false
                            duration = ""
                        }
                    } label: {
                        Text(saved ? "Saved" : "Save activity")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(duration.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                    }
                    .disabled(duration.isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

                VStack(spacing: 16) {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Type")

                            FlowLayout(spacing: 8) {
                                ForEach(activityTypes, id: \.self) { type in
                                    VPillButton(title: type, isSelected: actType == type) {
                                        actType = type
                                    }
                                }
                            }
                            .padding(.top, 8)

                            VLabelText(text: "Duration")
                                .padding(.top, 20)

                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                TextField("0", text: $duration)
                                    .keyboardType(.numberPad)
                                    .font(.vSerif(32))
                                    .foregroundStyle(Color.vForeground)
                                Text("minutes")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.vMutedForeground)
                            }
                            .padding(.top, 8)

                            VLabelText(text: "Intensity")
                                .padding(.top, 20)

                            HStack(spacing: 8) {
                                ForEach(intensities, id: \.self) { i in
                                    VPillButton(title: i, isSelected: intensity == i) {
                                        intensity = i
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                            .padding(.top, 8)
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            let activityEvents = state.timeline.filter { $0.type == .activity }

                            HStack {
                                VLabelText(text: "Recent activity")
                                Spacer()
                                Text("\(activityEvents.count) logged")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                            }

                            if activityEvents.isEmpty {
                                VStack(spacing: 6) {
                                    Text("No activity logged")
                                        .font(.system(size: 13))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    Text("Log a walk, run, or workout to track your movement.")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 24)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(activityEvents.enumerated()), id: \.element.id) { index, event in
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

                                        if index < activityEvents.count - 1 {
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
