import SwiftUI

private let mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"]

private let quickFoods = [
    "Oatmeal", "Eggs", "Toast", "Rice", "Chicken", "Salad",
    "Fruit", "Yogurt", "Pasta", "Fish", "Nuts", "Smoothie",
]

struct MealsLogView: View {
    @Environment(AppState.self) private var state
    @State private var mealType = "Breakfast"
    @State private var selected: [String] = []
    @State private var custom = ""
    @State private var notes = ""
    @State private var saved = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button {
                        guard !selected.isEmpty else { return }
                        state.addMeal(mealType: mealType, foods: selected, notes: notes)
                        saved = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            saved = false
                            selected = []
                            notes = ""
                        }
                    } label: {
                        Text(saved ? "Saved" : "Save meal")
                            .font(.system(size: 12, weight: .medium))
                            .tracking(0.4)
                            .foregroundStyle(Color.vBackground)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(selected.isEmpty ? Color.vForeground.opacity(0.3) : Color.vForeground)
                    }
                    .disabled(selected.isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)

                VStack(spacing: 16) {
                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            VLabelText(text: "Meal type")

                            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                                ForEach(mealTypes, id: \.self) { type in
                                    VPillButton(title: type, isSelected: mealType == type) {
                                        mealType = type
                                    }
                                }
                            }
                            .padding(.top, 12)

                            VLabelText(text: "What did you eat?")
                                .padding(.top, 20)

                            FlowLayout(spacing: 8) {
                                ForEach(quickFoods, id: \.self) { food in
                                    VPillButton(title: food, isSelected: selected.contains(food)) {
                                        if selected.contains(food) {
                                            selected.removeAll { $0 == food }
                                        } else {
                                            selected.append(food)
                                        }
                                    }
                                }
                            }
                            .padding(.top, 12)

                            HStack(spacing: 8) {
                                TextField("Add custom food...", text: $custom)
                                    .font(.system(size: 13))
                                    .foregroundStyle(Color.vForeground)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 10)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 0)
                                            .stroke(Color.vBorder, lineWidth: 0.5)
                                    )
                                    .onSubmit { addCustom() }

                                Button(action: addCustom) {
                                    Image(systemName: "plus")
                                        .font(.system(size: 14))
                                        .foregroundStyle(Color.vMutedForeground)
                                        .frame(width: 40, height: 40)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 0)
                                                .stroke(Color.vBorder, lineWidth: 0.5)
                                        )
                                }
                            }
                            .padding(.top, 16)
                        }
                    }

                    VCard {
                        VStack(alignment: .leading, spacing: 0) {
                            if !selected.isEmpty {
                                VLabelText(text: "Selected (\(selected.count))")

                                FlowLayout(spacing: 8) {
                                    ForEach(selected, id: \.self) { food in
                                        HStack(spacing: 6) {
                                            Text(food)
                                                .font(.system(size: 12))
                                                .foregroundStyle(Color.vForeground)
                                            Button {
                                                selected.removeAll { $0 == food }
                                            } label: {
                                                Image(systemName: "xmark")
                                                    .font(.system(size: 10))
                                                    .foregroundStyle(Color.vMutedForeground)
                                            }
                                        }
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(Color.vSecondary)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 0)
                                                .stroke(Color.vForeground.opacity(0.15), lineWidth: 0.5)
                                        )
                                    }
                                }
                                .padding(.top, 12)
                                .padding(.bottom, 20)
                            }

                            VLabelText(text: "Notes (optional)")

                            TextEditor(text: $notes)
                                .font(.system(size: 13))
                                .foregroundStyle(Color.vForeground)
                                .scrollContentBackground(.hidden)
                                .frame(minHeight: 100)
                                .padding(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 0)
                                        .stroke(Color.vBorder, lineWidth: 0.5)
                                )
                                .padding(.top, 12)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
        }
    }

    private func addCustom() {
        let trimmed = custom.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty, !selected.contains(trimmed) else { return }
        selected.append(trimmed)
        custom = ""
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
