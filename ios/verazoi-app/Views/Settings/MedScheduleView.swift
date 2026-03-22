import SwiftUI

struct MedScheduleView: View {
    @State private var schedules: [APIClient.MedScheduleRecord] = []
    @State private var showAdd = false
    @State private var name = ""
    @State private var doseValue = ""
    @State private var doseUnit = "mg"
    @State private var scheduleTime = Date()

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    VLabelText(text: "Medication Reminders")
                    Spacer()
                    Button { showAdd.toggle() } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                }

                if showAdd {
                    VStack(spacing: 10) {
                        TextField("Medication name", text: $name)
                            .font(.system(size: 13))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))

                        HStack(spacing: 8) {
                            TextField("Dose", text: $doseValue)
                                .font(.system(size: 13))
                                .keyboardType(.decimalPad)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))

                            HStack(spacing: 4) {
                                VPillButton(title: "mg", isSelected: doseUnit == "mg") { doseUnit = "mg" }
                                VPillButton(title: "units", isSelected: doseUnit == "units") { doseUnit = "units" }
                            }
                        }

                        DatePicker("Time", selection: $scheduleTime, displayedComponents: .hourAndMinute)
                            .font(.system(size: 13))
                            .foregroundStyle(Color.vForeground)

                        Button {
                            addSchedule()
                        } label: {
                            Text("Add Reminder")
                                .font(.system(size: 12, weight: .medium))
                                .tracking(0.4)
                                .foregroundStyle(Color.vBackground)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(name.isEmpty || doseValue.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                        }
                        .disabled(name.isEmpty || doseValue.isEmpty)
                    }
                    .padding(.top, 16)
                }

                if schedules.isEmpty && !showAdd {
                    Text("No medication reminders set.")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                } else {
                    VStack(spacing: 0) {
                        ForEach(schedules) { schedule in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(schedule.medicationName)
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundStyle(Color.vForeground)
                                    Text("\(schedule.doseValue, specifier: "%.0f") \(schedule.doseUnit)")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground)
                                }
                                Spacer()
                                Text(schedule.scheduleTime.prefix(5))
                                    .font(.system(size: 14, weight: .medium))
                                    .monospacedDigit()
                                    .foregroundStyle(Color.vForeground)

                                Button {
                                    deleteSchedule(id: schedule.id)
                                } label: {
                                    Image(systemName: "xmark")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.vMutedForeground.opacity(0.5))
                                }
                            }
                            .padding(.vertical, 10)
                            Divider().foregroundStyle(Color.vBorder)
                        }
                    }
                    .padding(.top, 16)
                }
            }
        }
        .task { await load() }
    }

    private func addSchedule() {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        let timeStr = formatter.string(from: scheduleTime)

        Task {
            _ = try? await APIClient.shared.createMedSchedule(
                name: name, doseValue: Double(doseValue) ?? 0, doseUnit: doseUnit,
                time: timeStr, days: [0, 1, 2, 3, 4, 5, 6]
            )
            name = ""; doseValue = ""; showAdd = false
            await load()
            syncNotifications()
        }
    }

    private func deleteSchedule(id: String) {
        Task {
            _ = try? await APIClient.shared.deleteMedSchedule(id: id)
            await load()
            syncNotifications()
        }
    }

    private func load() async {
        schedules = (try? await APIClient.shared.listMedSchedules()) ?? []
    }

    private func syncNotifications() {
        let items = schedules.map { s in
            (id: s.id, name: s.medicationName, dose: "\(s.doseValue) \(s.doseUnit)", time: String(s.scheduleTime.prefix(5)), days: s.daysOfWeek)
        }
        NotificationManager.shared.scheduleMedicationReminders(schedules: items)
    }
}
