import SwiftUI

private let activityTypes = ["Walking", "Running", "Cycling", "Weights", "Yoga", "Swimming", "HIIT", "Other"]
private let intensities = ["Light", "Moderate", "Intense"]

struct ActivityLogView: View {
    @Environment(AppState.self) private var state
    @State private var actType = "Walking"
    @State private var duration = ""
    @State private var intensity = "Moderate"
    @State private var saved = false
    @State private var isSaving = false
    @State private var saveError: String?

    private var parsedDuration: Int? {
        guard let d = Int(duration), d >= 1, d <= 480 else { return nil }
        return d
    }

    private var validationHint: String? {
        guard !duration.isEmpty, let d = Int(duration) else { return nil }
        if d < 1 || d > 480 { return "Duration must be 1-480 minutes" }
        return nil
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let dur = parsedDuration else { return }
                        isSaving = true
                        saveError = nil
                        Task {
                            do {
                                try await state.addActivity(activityType: actType, duration: dur, intensity: intensity)
                                saved = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    saved = false
                                    duration = ""
                                }
                            } catch {
                                saveError = userFacingErrorMessage(error, fallback: "Could not save activity.")
                            }
                            isSaving = false
                        }
                    } label: {
                        Text(saved ? "Saved" : (isSaving ? "Saving..." : "Save activity"))
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(parsedDuration != nil ? Color.vForeground : Color.vForeground.opacity(0.3))
                    }
                    .disabled(parsedDuration == nil || isSaving)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

                if let saveError {
                    Text(saveError)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vAmber)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

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

                            if let hint = validationHint {
                                Text(hint)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.vAmber)
                                    .padding(.top, 4)
                            }

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
                                                .monospacedDigit()
                                                .frame(width: 64, alignment: .trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .contextMenu {
                                            Button(role: .destructive) {
                                                state.deleteActivity(at: index)
                                            } label: {
                                                Label("Delete", systemImage: "trash")
                                            }
                                        }

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
