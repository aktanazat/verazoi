import SwiftUI

enum DesignVariant: String, CaseIterable {
    case classic
    case soft
    case mercury

    var title: String {
        switch self { case .soft: return "Soft"; case .mercury: return "Mercury"; default: return "Classic" }
    }
    var cardRadius: CGFloat {
        switch self { case .mercury: return 14; case .soft: return 16; default: return 0 }
    }
    var pillRadius: CGFloat {
        switch self { case .mercury: return 999; case .soft: return 20; default: return 0 }
    }
    var buttonRadius: CGFloat {
        switch self { case .mercury: return 999; case .soft: return 12; default: return 0 }
    }
    var cardShadow: CGFloat {
        switch self { case .mercury: return 0; case .soft: return 4; default: return 0 }
    }
    var useIconTabs: Bool { self == .soft || self == .mercury }
}

private struct DesignKey: EnvironmentKey {
    static let defaultValue = DesignVariant.classic
}

extension EnvironmentValues {
    var design: DesignVariant {
        get { self[DesignKey.self] }
        set { self[DesignKey.self] = newValue }
    }
}

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
    @Environment(\.design) private var design

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(Color.vCard)
            .clipShape(RoundedRectangle(cornerRadius: design.cardRadius))
            .overlay(
                RoundedRectangle(cornerRadius: design.cardRadius)
                    .stroke(Color.vBorder, lineWidth: design == .soft ? 0 : 0.5)
            )
            .shadow(color: .black.opacity(design == .soft ? 0.06 : 0), radius: design.cardShadow, y: 2)
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
    @Environment(\.design) private var design

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
                .background(isSelected ? (design == .soft ? Color.vPrimary : Color.vForeground) : Color.clear)
                .clipShape(RoundedRectangle(cornerRadius: design.pillRadius))
                .overlay(
                    RoundedRectangle(cornerRadius: design.pillRadius)
                        .stroke(Color.vBorder, lineWidth: isSelected || design == .soft ? 0 : 0.5)
                )
        }
    }
}
