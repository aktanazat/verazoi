import Foundation
import UserNotifications

final class NotificationManager {
    static let shared = NotificationManager()

    private var authorized = false

    func requestAuthorization() async {
        let center = UNUserNotificationCenter.current()
        authorized = (try? await center.requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    // MARK: - Spike Alerts

    func checkAndNotifySpike(risk: Double) {
        guard authorized, risk >= 0.6 else { return }

        let content = UNMutableNotificationContent()
        content.title = "Spike Risk Elevated"
        content.body = "Your glucose spike risk is \(Int(risk * 100))%. A short walk may help."
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "spike-\(Date().timeIntervalSince1970)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    // MARK: - Medication Reminders

    func scheduleMedicationReminders(schedules: [(id: String, name: String, dose: String, time: String, days: [Int])]) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: schedules.map { "med-\($0.id)" })

        for schedule in schedules {
            let parts = schedule.time.split(separator: ":")
            guard parts.count >= 2, let hour = Int(parts[0]), let minute = Int(parts[1]) else { continue }

            for day in schedule.days {
                let content = UNMutableNotificationContent()
                content.title = schedule.name
                content.body = "Time to take \(schedule.dose)"
                content.sound = .default

                var dateComponents = DateComponents()
                dateComponents.hour = hour
                dateComponents.minute = minute
                dateComponents.weekday = day + 1 // UNCalendarNotificationTrigger uses 1=Sunday

                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
                let request = UNNotificationRequest(
                    identifier: "med-\(schedule.id)-\(day)",
                    content: content,
                    trigger: trigger
                )
                center.add(request)
            }
        }
    }

    func cancelAllMedicationReminders() {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { requests in
            let medIds = requests.filter { $0.identifier.hasPrefix("med-") }.map(\.identifier)
            center.removePendingNotificationRequests(withIdentifiers: medIds)
        }
    }
}
