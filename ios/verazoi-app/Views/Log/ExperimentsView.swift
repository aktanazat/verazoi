import SwiftUI

struct ExperimentsView: View {
    @State private var experiments: [APIClient.ExperimentRecord] = []
    @State private var showCreate = false
    @State private var name = ""
    @State private var foodA = ""
    @State private var foodB = ""
    @State private var selectedExperiment: APIClient.ExperimentComparison?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack {
                    VLabelText(text: "Food Experiments")
                    Spacer()
                    Button {
                        showCreate.toggle()
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 14))
                            .foregroundStyle(Color.vMutedForeground)
                    }
                }
                .padding(.horizontal, 20)

                if showCreate {
                    VCard {
                        VStack(alignment: .leading, spacing: 12) {
                            VLabelText(text: "New Experiment")

                            TextField("Experiment name", text: $name)
                                .font(.system(size: 13))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 10)
                                .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))

                            HStack(spacing: 12) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Food A")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.vMutedForeground)
                                    TextField("e.g. Oatmeal", text: $foodA)
                                        .font(.system(size: 13))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Food B")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.vMutedForeground)
                                    TextField("e.g. Eggs", text: $foodB)
                                        .font(.system(size: 13))
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .overlay(RoundedRectangle(cornerRadius: 0).stroke(Color.vBorder, lineWidth: 0.5))
                                }
                            }

                            Button {
                                createExperiment()
                            } label: {
                                Text("Create")
                                    .font(.system(size: 12, weight: .medium))
                                    .tracking(0.4)
                                    .foregroundStyle(Color.vBackground)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(name.isEmpty || foodA.isEmpty || foodB.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                            }
                            .disabled(name.isEmpty || foodA.isEmpty || foodB.isEmpty)
                        }
                    }
                    .padding(.horizontal, 20)
                }

                if let comparison = selectedExperiment {
                    ComparisonCard(comparison: comparison)
                        .padding(.horizontal, 20)
                }

                ForEach(experiments) { exp in
                    Button {
                        loadExperiment(id: exp.id)
                    } label: {
                        VCard {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(exp.name)
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundStyle(Color.vForeground)
                                    Text("\(exp.foodA) vs \(exp.foodB)")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.vMutedForeground)
                                }
                                Spacer()
                                Text(exp.status.capitalized)
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundStyle(exp.status == "active" ? Color.vPrimary : Color.vMutedForeground)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }

                if experiments.isEmpty && !showCreate {
                    VCard {
                        VStack(spacing: 8) {
                            Text("No experiments yet")
                                .font(.system(size: 13))
                                .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                            Text("Compare how different foods affect your glucose with A/B testing.")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 24)
                    }
                    .padding(.horizontal, 20)
                }
            }
            .padding(.bottom, 32)
        }
        .task { await loadExperiments() }
    }

    private func createExperiment() {
        Task {
            _ = try? await APIClient.shared.createExperiment(name: name, foodA: foodA, foodB: foodB)
            name = ""; foodA = ""; foodB = ""; showCreate = false
            await loadExperiments()
        }
    }

    private func loadExperiments() async {
        experiments = (try? await APIClient.shared.listExperiments()) ?? []
    }

    private func loadExperiment(id: String) {
        Task {
            selectedExperiment = try? await APIClient.shared.getExperiment(id: id)
        }
    }
}

private struct ComparisonCard: View {
    let comparison: APIClient.ExperimentComparison

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: comparison.experiment.name)

                HStack(spacing: 16) {
                    ArmColumn(label: comparison.experiment.foodA, entries: comparison.armA, avgDelta: comparison.avgDeltaA)
                    Divider().frame(height: 80).foregroundStyle(Color.vBorder)
                    ArmColumn(label: comparison.experiment.foodB, entries: comparison.armB, avgDelta: comparison.avgDeltaB)
                }
                .padding(.top, 16)
            }
        }
    }
}

private struct ArmColumn: View {
    let label: String
    let entries: [APIClient.ExperimentEntryRecord]
    let avgDelta: Double?

    var body: some View {
        VStack(spacing: 8) {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.vForeground)

            if let avg = avgDelta {
                Text("\(avg > 0 ? "+" : "")\(Int(avg)) mg/dL")
                    .font(.vSerif(24))
                    .foregroundStyle(Color.vForeground)
            } else {
                Text("--")
                    .font(.vSerif(24))
                    .foregroundStyle(Color.vMutedForeground)
            }

            Text("\(entries.count) entries")
                .font(.system(size: 11))
                .foregroundStyle(Color.vMutedForeground)
        }
        .frame(maxWidth: .infinity)
    }
}
