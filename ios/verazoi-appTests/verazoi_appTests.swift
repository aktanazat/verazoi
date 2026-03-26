import Foundation
import Testing
@testable import verazoi_app

struct verazoi_appTests {
    @Test func wearableSyncEncodingUsesIso8601() throws {
        let encoder = APIClient.makeEncoder()
        let recordedAt = try #require(
            ISO8601DateFormatter().date(from: "2026-03-25T12:00:00Z")
        )
        let body = APIClient.WearableSyncBody(
            heartRate: 58,
            steps: 8421,
            activeMinutes: 41,
            sleepHours: 7.5,
            sleepQuality: "good",
            glucoseReadings: [
                SyncedGlucoseReading(
                    value: 112,
                    recordedAt: recordedAt
                )
            ]
        )

        let data = try encoder.encode(body)
        let json = try #require(JSONSerialization.jsonObject(with: data) as? [String: Any])
        let readings = try #require(json["glucose_readings"] as? [[String: Any]])

        #expect(readings.count == 1)
        #expect(readings[0]["value"] as? Int == 112)
        #expect(readings[0]["recorded_at"] as? String == "2026-03-25T12:00:00Z")
    }

    @Test func insightGenerateBodyPreservesReviewedPrompt() throws {
        let encoder = APIClient.makeEncoder()
        let body = APIClient.InsightGenerateBody(
            weekStart: "2026-03-23",
            userPrompt: "Week: 2026-03-23 to 2026-03-29\n\nGlucose readings (1):\n  Tue 08:00 - 110 mg/dL (cgm)"
        )

        let data = try encoder.encode(body)
        let json = try #require(JSONSerialization.jsonObject(with: data) as? [String: String])

        #expect(json["week_start"] == "2026-03-23")
        #expect(json["user_prompt"] == body.userPrompt)
    }
}
