import SwiftUI

struct DailyTimelineView: View {
    let events: [TimelineEvent]

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VStack(alignment: .leading, spacing: 4) {
                    VLabelText(text: "Today's Log")
                    Text("\(events.count) entries")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vMutedForeground.opacity(0.8))
                }

                if events.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 20, weight: .light))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                        Text("No entries yet")
                            .font(.system(size: 13))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.6))
                        Text("Log glucose, meals, activity, or sleep to see your day here.")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.vMutedForeground.opacity(0.4))
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 32)
                } else {
                    VStack(spacing: 0) {
                        ForEach(Array(events.enumerated()), id: \.element.id) { index, event in
                            HStack(alignment: .top, spacing: 16) {
                                VStack(spacing: 0) {
                                    ZStack {
                                        RoundedRectangle(cornerRadius: 0)
                                            .stroke(Color.vBorder, lineWidth: 0.5)
                                            .frame(width: 28, height: 28)
                                        Image(systemName: event.type.systemImage)
                                            .font(.system(size: 12, weight: .light))
                                            .foregroundStyle(Color.vMutedForeground)
                                    }

                                    if index < events.count - 1 {
                                        Rectangle()
                                            .fill(Color.vBorder)
                                            .frame(width: 0.5)
                                            .frame(maxHeight: .infinity)
                                    }
                                }

                                VStack(alignment: .leading, spacing: 0) {
                                    HStack(alignment: .top) {
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
                                }
                                .padding(.bottom, index < events.count - 1 ? 12 : 0)
                            }
                        }
                    }
                    .padding(.top, 24)
                }
            }
        }
    }
}
