import SwiftUI

private let doseUnits = ["mg", "units"]

struct MedicationLogView: View {
    @Environment(AppState.self) private var state
    @State private var name = ""
    @State private var doseValue = ""
    @State private var doseUnit = "mg"
    @State private var timing: MedicationTiming = .morning
    @State private var notes = ""
    @State private var saved = false

    private var canSave: Bool {
        !name.isEmpty && !doseValue.isEmpty
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard let dose = Double(doseValue) else { return }
                        state.addMedication(name: name, doseValue: dose, doseUnit: doseUnit, timing: timing.rawValue, notes: notes)
                        saved = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            saved = false
                            name = ""
                            doseValue = ""
                            notes = ""
                        }
                    } label: {
                        Text(saved ? "Saved" : "Log medication")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(canSave ? Color.vForeground : Color.vForeground.opacity(0.3))
                    }
                    .disabled(!canSave)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

                VStack(spacing: 16) {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Name")

                            TextField("Metformin, Insulin, etc.", text: $name)
                                .font(.system(size: 15))
                                .foregroundStyle(Color.vForeground)
                                .padding(.top, 8)

                            VLabelText(text: "Dose")
                                .padding(.top, 20)

                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                TextField("0", text: $doseValue)
                                    .keyboardType(.decimalPad)
                                    .font(.vSerif(32))
                                    .foregroundStyle(Color.vForeground)

                                HStack(spacing: 8) {
                                    ForEach(doseUnits, id: \.self) { unit in
                                        VPillButton(title: unit, isSelected: doseUnit == unit) {
                                            doseUnit = unit
                                        }
                                    }
                                }
                            }
                            .padding(.top, 8)

                            VLabelText(text: "Timing")
                                .padding(.top, 20)

                            FlowLayout(spacing: 8) {
                                ForEach(MedicationTiming.allCases, id: \.self) { t in
                                    VPillButton(title: t.displayName, isSelected: timing == t) {
                                        timing = t
                                    }
                                }
                            }
                            .padding(.top, 8)

                            VLabelText(text: "Notes")
                                .padding(.top, 20)

                            TextField("Optional notes", text: $notes)
                                .font(.system(size: 13))
                                .foregroundStyle(Color.vForeground)
                                .padding(.top, 8)
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            let medEvents = state.timeline.filter { $0.type == .medication }

                            HStack {
                                VLabelText(text: "Recent medications")
                                Spacer()
                                Text("\(medEvents.count) logged")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                            }

                            if medEvents.isEmpty {
                                VStack(spacing: 6) {
                                    Text("No medications logged")
                                        .font(.system(size: 13))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                                    Text("Log your medications to track dosage and timing.")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 24)
                            } else {
                                VStack(spacing: 0) {
                                    ForEach(Array(medEvents.enumerated()), id: \.element.id) { index, event in
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

                                        if index < medEvents.count - 1 {
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
