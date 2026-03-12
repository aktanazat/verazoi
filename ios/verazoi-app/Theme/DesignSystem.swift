import SwiftUI

extension Color {
    // Indigo Vitals - Light Mode (matching website oklch values)
    static let vBackground = Color(red: 0.953, green: 0.949, blue: 0.969)      // oklch(0.965 0.007 285)
    static let vForeground = Color(red: 0.114, green: 0.102, blue: 0.220)      // oklch(0.2 0.05 280)
    static let vCard = Color(red: 0.976, green: 0.973, blue: 0.988)            // oklch(0.975 0.005 285)
    static let vPrimary = Color(red: 0.298, green: 0.243, blue: 0.749)         // oklch(0.42 0.14 280)
    static let vPrimaryForeground = Color(red: 0.976, green: 0.973, blue: 0.988)
    static let vSecondary = Color(red: 0.906, green: 0.898, blue: 0.945)       // oklch(0.93 0.015 280)
    static let vMutedForeground = Color(red: 0.447, green: 0.431, blue: 0.616) // oklch(0.45 0.045 280)
    static let vBorder = Color(red: 0.843, green: 0.835, blue: 0.902)          // oklch(0.88 0.02 280)
    static let vAmber = Color(red: 0.600, green: 0.400, blue: 0.100)
}

extension Font {
    static func vSerif(_ size: CGFloat, weight: Font.Weight = .light) -> Font {
        .system(size: size, weight: weight, design: .serif)
    }

    static func vLabel() -> Font {
        .system(size: 11, weight: .medium, design: .default)
    }

    static func vBody() -> Font {
        .system(size: 13, weight: .regular, design: .default)
    }
}

struct VCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(Color.vCard)
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.vBorder, lineWidth: 0.5)
            )
    }
}

struct VLabelText: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundStyle(Color.vMutedForeground)
    }
}

struct VPillButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .tracking(0.4)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
                .foregroundStyle(isSelected ? Color.vPrimaryForeground : Color.vMutedForeground)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isSelected ? Color.vForeground : Color.clear)
                .overlay(
                    RoundedRectangle(cornerRadius: 0)
                        .stroke(isSelected ? Color.vForeground : Color.vBorder, lineWidth: 0.5)
                )
        }
    }
}
