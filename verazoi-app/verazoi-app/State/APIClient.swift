import Foundation

enum APIError: Error {
    case invalidURL
    case httpError(Int, String)
    case decodingError
}

actor APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let baseURL = "http://localhost:8000/api/v1"
    #else
    private let baseURL = "https://api.verazoi.com/api/v1"
    #endif

    private var token: String?
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        d.dateDecodingStrategy = .iso8601
        return d
    }()
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }()

    func setToken(_ t: String?) { token = t }

    // MARK: - Core

    private func request<T: Decodable>(_ method: String, _ path: String, body: Encodable? = nil) async throws -> T {
        guard let url = URL(string: baseURL + path) else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try encoder.encode(body) }

        let (data, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0

        if status < 200 || status >= 300 {
            let detail = (try? JSONDecoder().decode([String: String].self, from: data))?["detail"] ?? "Error \(status)"
            throw APIError.httpError(status, detail)
        }

        return try decoder.decode(T.self, from: data)
    }

    // MARK: - Auth

    struct TokenResponse: Decodable { let accessToken: String }
    struct AuthBody: Encodable { let email: String; let password: String }

    func register(email: String, password: String) async throws -> String {
        let res: TokenResponse = try await request("POST", "/auth/register", body: AuthBody(email: email, password: password))
        token = res.accessToken
        return res.accessToken
    }

    func login(email: String, password: String) async throws -> String {
        let res: TokenResponse = try await request("POST", "/auth/login", body: AuthBody(email: email, password: password))
        token = res.accessToken
        return res.accessToken
    }

    // MARK: - Glucose

    struct GlucoseBody: Encodable { let value: Int; let timing: String }
    struct GlucoseRecord: Decodable, Identifiable { let id: String; let value: Int; let timing: String; let recordedAt: Date }

    func createGlucose(value: Int, timing: String) async throws -> GlucoseRecord {
        try await request("POST", "/glucose", body: GlucoseBody(value: value, timing: timing))
    }

    func listGlucose(limit: Int = 50) async throws -> [GlucoseRecord] {
        try await request("GET", "/glucose?limit=\(limit)")
    }

    // MARK: - Meals

    struct MealBody: Encodable { let mealType: String; let foods: [String]; let notes: String }
    struct MealRecord: Decodable, Identifiable { let id: String; let mealType: String; let foods: [String]; let notes: String; let recordedAt: Date }

    func createMeal(mealType: String, foods: [String], notes: String) async throws -> MealRecord {
        try await request("POST", "/meals", body: MealBody(mealType: mealType, foods: foods, notes: notes))
    }

    func listMeals(limit: Int = 50) async throws -> [MealRecord] {
        try await request("GET", "/meals?limit=\(limit)")
    }

    // MARK: - Activities

    struct ActivityBody: Encodable { let activityType: String; let duration: Int; let intensity: String }
    struct ActivityRecord: Decodable, Identifiable { let id: String; let activityType: String; let duration: Int; let intensity: String; let recordedAt: Date }

    func createActivity(activityType: String, duration: Int, intensity: String) async throws -> ActivityRecord {
        try await request("POST", "/activities", body: ActivityBody(activityType: activityType, duration: duration, intensity: intensity))
    }

    func listActivities(limit: Int = 50) async throws -> [ActivityRecord] {
        try await request("GET", "/activities?limit=\(limit)")
    }

    // MARK: - Sleep

    struct SleepBody: Encodable { let hours: Double; let quality: String }
    struct SleepRecord: Decodable, Identifiable { let id: String; let hours: Double; let quality: String; let recordedAt: Date }

    func createSleep(hours: Double, quality: String) async throws -> SleepRecord {
        try await request("POST", "/sleep", body: SleepBody(hours: hours, quality: quality))
    }

    func listSleep(limit: Int = 50) async throws -> [SleepRecord] {
        try await request("GET", "/sleep?limit=\(limit)")
    }

    // MARK: - Timeline

    struct TimelineRecord: Decodable, Identifiable { let id: String; let type: String; let label: String; let value: String; let recordedAt: Date }

    func listTimeline(limit: Int = 50) async throws -> [TimelineRecord] {
        try await request("GET", "/timeline?limit=\(limit)")
    }

    // MARK: - Stability

    struct StabilityScore: Decodable {
        let score: Int
        let glucoseComponent: Double
        let activityComponent: Double
        let sleepComponent: Double
        let heartRateComponent: Double
        let spikeRisk: Double
        let spikeFactors: [SpikeFactor]
    }

    struct SpikeFactor: Decodable {
        let label: String
        let impact: String
        let weight: Double
    }

    func getStabilityScore() async throws -> StabilityScore {
        try await request("GET", "/stability/score")
    }

    // MARK: - Wearable Sync

    struct WearableSyncBody: Encodable {
        let heartRate: Int?
        let steps: Int?
        let activeMinutes: Int?
        let sleepHours: Double?
        let sleepQuality: String?
    }

    func syncWearable(heartRate: Int?, steps: Int?, activeMinutes: Int?, sleepHours: Double?, sleepQuality: String?) async throws {
        let _: [String: String] = try await request("POST", "/sync/wearable", body: WearableSyncBody(
            heartRate: heartRate, steps: steps, activeMinutes: activeMinutes,
            sleepHours: sleepHours, sleepQuality: sleepQuality
        ))
    }
}
