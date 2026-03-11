import SwiftUI

struct GlucoseLogView: View {
    @Environment(AppState.self) private var state
    @State private var glucoseValue = ""
    @State private var timing: GlucoseTiming = .fasting
    @State private var saved = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let value = Int(glucoseValue) else { return }
                        state.addGlucoseReading(value: value, timing: timing)
                        saved = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            saved = false
                            glucoseValue = ""
                        }
                    } label: {
                        Text(saved ? "Saved" : "Save reading")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(glucoseValue.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                    }
                    .disabled(glucoseValue.isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

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

                            VLabelText(text: "Timing")
                                .padding(.top, 20)

                            HStack(spacing: 8) {
                                ForEach(GlucoseTiming.allCases, id: \.self) { t in
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
                                        HStack {
                                            HStack(spacing: 16) {
                                                Text(reading.time)
                                                    .font(.system(size: 13))
                                                    .foregroundStyle(Color.vMutedForeground)
                                                Text("\(reading.value)")
                                                    .font(.vSerif(20))
                                                    .foregroundStyle(Color.vForeground)
                                            }
                                            Spacer()
                                            TrendIcon(reading: reading, previous: index > 0 ? state.glucoseReadings[index - 1] : nil)
                                        }
                                        .padding(.vertical, 12)

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
    }
}
