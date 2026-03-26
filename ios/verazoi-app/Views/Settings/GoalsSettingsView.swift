import SwiftUI

struct GoalsSettingsCard: View {
    @Environment(AppState.self) private var state
    @State private var glucoseLow: Int = 70
    @State private var glucoseHigh: Int = 140
    @State private var dailySteps: Int = 10000
    @State private var sleepHours: Double = 8
    @State private var saving = false
    @State private var saveError: String?

    private var rangeInvalid: Bool {
        glucoseLow >= glucoseHigh
    }

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Goals")

                VLabelText(text: "Glucose range (mg/dL)")
                    .padding(.top, 16)

                HStack(spacing: 16) {
                    Stepper("Low: \(glucoseLow)", value: $glucoseLow, in: 50...120, step: 5)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vForeground)
                }
                .padding(.top, 8)

                HStack(spacing: 16) {
                    Stepper("High: \(glucoseHigh)", value: $glucoseHigh, in: 100...200, step: 5)
                        .font(.system(size: 13))
                        .foregroundStyle(Color.vForeground)
                }
                .padding(.top, 8)

                if rangeInvalid {
                    Text("Low must be less than high")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.vAmber)
                        .padding(.top, 4)
                } else if let saveError {
                    Text(saveError)
                        .font(.system(size: 11))
                        .foregroundStyle(Color.vAmber)
                        .padding(.top, 4)
                }

                VLabelText(text: "Daily steps")
                    .padding(.top, 20)

                Stepper("\(dailySteps) steps", value: $dailySteps, in: 1000...30000, step: 1000)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 8)

                VLabelText(text: "Sleep target")
                    .padding(.top, 20)

                Stepper("\(String(format: "%.1f", sleepHours)) hrs", value: $sleepHours, in: 4...12, step: 0.5)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.vForeground)
                    .padding(.top, 8)

                Button {
                    saveError = nil
                    saving = true
                    Task {
                        do {
                            let savedGoals = try await APIClient.shared.updateGoals(
                                glucoseLow: glucoseLow,
                                glucoseHigh: glucoseHigh,
                                dailySteps: dailySteps,
                                sleepHours: sleepHours
                            )
                            state.goals = UserGoals(
                                glucoseLow: savedGoals.glucoseLow,
                                glucoseHigh: savedGoals.glucoseHigh,
                                dailySteps: savedGoals.dailySteps,
                                sleepHours: savedGoals.sleepHours
                            )
                        } catch let error as APIError {
                            if case .httpError(_, let detail) = error {
                                saveError = detail
                            } else {
                                saveError = "Could not save goals."
                            }
                        } catch {
                            saveError = "Could not save goals."
                        }
                        saving = false
                    }
                } label: {
                    Text(saving ? "Saving..." : "Save goals")
                        .font(.system(size: 12, weight: .medium))
                        .tracking(0.4)
                        .foregroundStyle(Color.vBackground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(saving || rangeInvalid ? Color.vForeground.opacity(0.3) : Color.vForeground)
                }
                .disabled(saving || rangeInvalid)
                .padding(.top, 20)
            }
        }
        .onAppear {
            glucoseLow = state.goals.glucoseLow
            glucoseHigh = state.goals.glucoseHigh
            dailySteps = state.goals.dailySteps
            sleepHours = state.goals.sleepHours
        }
    }
}
