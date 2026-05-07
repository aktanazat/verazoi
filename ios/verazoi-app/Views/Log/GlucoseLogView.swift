import SwiftUI

struct GlucoseLogView: View {
    @Environment(AppState.self) private var state
    @State private var glucoseValue = ""
    @State private var timing: GlucoseTiming = .fasting
    @State private var saved = false
    @State private var isSaving = false
    @State private var saveError: String?

    private var parsedValue: Int? {
        guard let v = Int(glucoseValue), v >= 30, v <= 500 else { return nil }
        return v
    }

    private var validationHint: String? {
        guard !glucoseValue.isEmpty, let v = Int(glucoseValue) else { return nil }
        if v < 30 || v > 500 { return "Value must be 30-500 mg/dL" }
        return nil
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let value = parsedValue else { return }
                        isSaving = true
                        saveError = nil
                        Task {
                            do {
                                try await state.addGlucoseReading(value: value, timing: timing)
                                saved = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    saved = false
                                    glucoseValue = ""
                                }
                            } catch {
                                saveError = userFacingErrorMessage(error, fallback: "Could not save reading.")
                            }
                            isSaving = false
                        }
                    } label: {
                        Text(saved ? "Saved" : (isSaving ? "Saving..." : "Save reading"))
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(parsedValue != nil ? Color.vForeground : Color.vForeground.opacity(0.3))
                    }
                    .disabled(parsedValue == nil || isSaving)
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
                            VLabelText(text: "Reading")

                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                TextField("0", text: $glucoseValue)
                                    .keyboardType(.numberPad)
                                    .font(.vSerif(36))
                                    .foregroundStyle(Color.vForeground)
                                Text("mg/dL")
                                    .font(.system(size: 14))
                                    .foregroundStyle(Color.vMutedForeground)
                            }
                            .padding(.top, 16)

                            if let hint = validationHint {
                                Text(hint)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.vAmber)
                                    .padding(.top, 4)
                            }

                            VLabelText(text: "Timing")
                                .padding(.top, 20)

                            HStack(spacing: 8) {
                                ForEach(GlucoseTiming.manualCases, id: \.self) { t in
                                    VPillButton(
                                        title: t.displayName,
                                        isSelected: timing == t
                                    ) {
                                        timing = t
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                            }
                            .padding(.top, 12)
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            HStack {
                                HStack(spacing: 8) {
                                    Image(systemName: "clock")
                                        .font(.system(size: 13, weight: .light))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                                    VLabelText(text: "Today")
                                }
                                Spacer()
                                Text("\(state.glucoseReadings.count) readings")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                            }

                            if state.glucoseReadings.isEmpty {
                                VStack(spacing: 6) {
                                    Text("No readings yet")
                                        .font(.system(size: 13))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    Text("Add your first glucose reading above.")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 24)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(state.glucoseReadings.enumerated()), id: \.element.id) { index, reading in
                                        HStack(spacing: 14) {
                                            Text(reading.time)
                                                .font(.system(size: 12))
                                                .foregroundStyle(Color.vMutedForeground)
                                                .monospacedDigit()
                                                .frame(width: 64, alignment: .leading)
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text("\(reading.value)")
                                                    .font(.vSerif(20))
                                                    .foregroundStyle(Color.vForeground)
                                                    .monospacedDigit()
                                                    .accessibilityLabel("\(reading.value) milligrams per deciliter")
                                                Text(reading.timing.displayName)
                                                    .font(.system(size: 11))
                                                    .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                                            }
                                            Spacer()
                                            TrendIcon(reading: reading, previous: index > 0 ? state.glucoseReadings[index - 1] : nil)
                                        }
                                        .padding(.vertical, 12)
                                        .contextMenu {
                                            Button(role: .destructive) {
                                                state.deleteGlucoseReading(at: index)
                                            } label: {
                                                Label("Delete", systemImage: "trash")
                                            }
                                        }

                                        if index < state.glucoseReadings.count - 1 {
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

private struct TrendIcon: View {
    let reading: GlucoseReading
    let previous: GlucoseReading?

    private var trend: String {
        guard let prev = previous else { return "stable" }
        let diff = reading.value - prev.value
        if diff > 10 { return "up" }
        if diff < -10 { return "down" }
        return "stable"
    }

    var body: some View {
        Image(systemName: trend == "up" ? "arrow.up.right" : trend == "down" ? "arrow.down.right" : "minus")
            .font(.system(size: 14, weight: .light))
            .foregroundStyle(
                trend == "up" ? Color.vAmber.opacity(0.7) :
                trend == "down" ? Color(red: 0.2, green: 0.5, blue: 0.3).opacity(0.6) :
                Color.vMutedForeground.opacity(0.6)
            )
            .accessibilityLabel(trend == "up" ? "Trending up" : trend == "down" ? "Trending down" : "Stable")
    }
}
