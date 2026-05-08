import SwiftUI

private let qualities = ["poor", "fair", "good", "great"]

struct SleepLogView: View {
    @Environment(AppState.self) private var state
    @State private var sleepHours = ""
    @State private var sleepQuality = "good"
    @State private var saved = false
    @State private var isSaving = false
    @State private var saveError: String?

    private var parsedHours: Double? {
        guard let h = Double(sleepHours), h > 0, h <= 24 else { return nil }
        return (h * 10).rounded() / 10
    }

    private var validationHint: String? {
        guard !sleepHours.isEmpty, let h = Double(sleepHours) else { return nil }
        if h <= 0 || h > 24 { return "Hours must be between 0 and 24" }
        return nil
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let hours = parsedHours else { return }
                        isSaving = true
                        saveError = nil
                        Task {
                            do {
                                try await state.addSleep(hours: hours, quality: sleepQuality)
                                saved = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    saved = false
                                    sleepHours = ""
                                }
                            } catch {
                                saveError = userFacingErrorMessage(error, fallback: "Could not save sleep.")
                            }
                            isSaving = false
                        }
                    } label: {
                        Text(saved ? "Saved" : (isSaving ? "Saving..." : "Save sleep"))
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(parsedHours != nil ? Color.vForeground : Color.vForeground.opacity(0.3))
                    }
                    .disabled(parsedHours == nil || isSaving)
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

                            if let hint = validationHint {
                                Text(hint)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.vAmber)
                                    .padding(.top, 4)
                            }

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
                                                .monospacedDigit()
                                                .frame(width: 64, alignment: .trailing)
                                        }
                                        .padding(.vertical, 12)
                                        .contextMenu {
                                            Button(role: .destructive) {
                                                state.deleteSleep(at: index)
                                            } label: {
                                                Label("Delete", systemImage: "trash")
                                            }
                                        }

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
