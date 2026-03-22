import Foundation

enum APIError: Error {
    case invalidURL
    case httpError(Int, String)
    case decodingError
    case notAuthenticated
}

actor APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let baseURL = "http://localhost:8000/api/v1"
    #else
    private let baseURL = "https://verazoi-api.onrender.com/api/v1"
    #endif

    private var token: String?
    private var refreshToken: String?
    private var isRefreshing = false

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
    func setRefreshToken(_ t: String?) { refreshToken = t }
    func getToken() -> String? { token }

    // MARK: - Core

    private func request<T: Decodable>(_ method: String, _ path: String, body: Encodable? = nil, retry: Bool = true) async throws -> T {
        guard let url = URL(string: baseURL + path) else { throw APIError.invalidURL }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body { req.httpBody = try encoder.encode(body) }

        let (data, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0

        if status == 401 && retry {
            let refreshed = await attemptTokenRefresh()
            if refreshed {
                return try await request(method, path, body: body, retry: false)
            }
            throw APIError.notAuthenticated
        }

        if status < 200 || status >= 300 {
            let detail = (try? JSONDecoder().decode([String: String].self, from: data))?["detail"] ?? "Error \(status)"
            throw APIError.httpError(status, detail)
        }

        return try decoder.decode(T.self, from: data)
    }

    private func attemptTokenRefresh() async -> Bool {
        // Token refresh for iOS uses the stored refresh token
        // The backend supports Bearer auth for mobile clients
        // For now, signal that re-login is needed
        return false
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

    func logout() async {
        // Hit the logout endpoint to revoke server-side refresh tokens
        if token != nil {
            _ = try? await request("POST", "/auth/logout") as [String: String]
        }
        token = nil
        refreshToken = nil
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

    // MARK: - Medications

    struct MedicationBody: Encodable { let name: String; let doseValue: Double; let doseUnit: String; let timing: String; let notes: String }
    struct MedicationRecord: Decodable, Identifiable { let id: String; let name: String; let doseValue: Double; let doseUnit: String; let timing: String; let notes: String; let recordedAt: Date }

    func createMedication(name: String, doseValue: Double, doseUnit: String, timing: String, notes: String) async throws -> MedicationRecord {
        try await request("POST", "/medications", body: MedicationBody(name: name, doseValue: doseValue, doseUnit: doseUnit, timing: timing, notes: notes))
    }

    func listMedications(limit: Int = 50) async throws -> [MedicationRecord] {
        try await request("GET", "/medications?limit=\(limit)")
    }

    // MARK: - Goals

    struct GoalsBody: Encodable { let glucoseLow: Int; let glucoseHigh: Int; let dailySteps: Int; let sleepHours: Double }
    struct GoalsRecord: Decodable { let glucoseLow: Int; let glucoseHigh: Int; let dailySteps: Int; let sleepHours: Double }
    struct GoalProgressRecord: Decodable { let glucoseInRangePct: Double; let stepsToday: Int; let stepsTarget: Int; let sleepLast: Double; let sleepTarget: Double }

    func getGoals() async throws -> GoalsRecord {
        try await request("GET", "/goals")
    }

    func updateGoals(glucoseLow: Int, glucoseHigh: Int, dailySteps: Int, sleepHours: Double) async throws -> GoalsRecord {
        try await request("PUT", "/goals", body: GoalsBody(glucoseLow: glucoseLow, glucoseHigh: glucoseHigh, dailySteps: dailySteps, sleepHours: sleepHours))
    }

    func getGoalProgress() async throws -> GoalProgressRecord {
        try await request("GET", "/goals/progress")
    }

    // MARK: - Trends

    struct GlucoseTrendRecord: Decodable { let date: String; let avg: Double; let min: Int; let max: Int; let count: Int }
    struct StabilityTrendRecord: Decodable { let date: String; let score: Int }

    func getGlucoseTrend(days: Int = 7) async throws -> [GlucoseTrendRecord] {
        try await request("GET", "/trends/glucose?days=\(days)")
    }

    func getStabilityTrend(days: Int = 30) async throws -> [StabilityTrendRecord] {
        try await request("GET", "/trends/stability?days=\(days)")
    }

    // MARK: - Correlations

    struct FoodImpactRecord: Decodable { let food: String; let avgDelta: Double; let occurrences: Int }

    func getFoodImpact(days: Int = 30) async throws -> [FoodImpactRecord] {
        try await request("GET", "/correlations/food-impact?days=\(days)")
    }

    // MARK: - Insights

    struct InsightRecord: Decodable { let id: String; let weekStart: String; let summary: String; let generatedAt: String }

    func getWeeklyInsight() async throws -> InsightRecord {
        try await request("GET", "/insights/weekly")
    }

    func generateWeeklyInsight() async throws -> InsightRecord {
        try await request("POST", "/insights/weekly/generate")
    }

    func getInsightHistory(limit: Int = 10) async throws -> [InsightRecord] {
        try await request("GET", "/insights/history?limit=\(limit)")
    }

    // MARK: - CGM

    struct CGMConnectBody: Encodable { let provider: String; let username: String; let password: String }
    struct CGMStatus: Decodable { let provider: String; let active: Bool; let lastSync: String? }

    func connectCGM(provider: String, username: String, password: String) async throws {
        let _: [String: String] = try await request("POST", "/cgm/connect", body: CGMConnectBody(provider: provider, username: username, password: password))
    }

    func syncCGM() async throws -> [String: String] {
        try await request("POST", "/cgm/sync")
    }

    func getCGMStatus() async throws -> [CGMStatus] {
        try await request("GET", "/cgm/status")
    }

    func disconnectCGM() async throws {
        let _: [String: String] = try await request("DELETE", "/cgm/disconnect")
    }

    // MARK: - Meal Photo Recognition

    func recognizeFood(imageData: Data) async throws -> [String] {
        guard let url = URL(string: baseURL + "/meals/recognize-photo") else { throw APIError.invalidURL }

        let boundary = UUID().uuidString
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"photo\"; filename=\"photo.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        req.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status < 200 || status >= 300 { throw APIError.httpError(status, "Recognition failed") }

        struct FoodResponse: Decodable { let foods: [String] }
        return try decoder.decode(FoodResponse.self, from: data).foods
    }

    // MARK: - Pre-meal Playbook

    struct PlaybookEntry: Decodable { let food: String; let avgDelta: Double; let occurrences: Int; let suggestion: String? }

    func getPlaybook(foods: [String]) async throws -> [PlaybookEntry] {
        let query = foods.joined(separator: ",")
        return try await request("GET", "/meals/playbook?foods=\(query)")
    }

    // MARK: - Experiments

    struct ExperimentBody: Encodable { let name: String; let foodA: String; let foodB: String }
    struct ExperimentRecord: Decodable, Identifiable { let id: String; let name: String; let foodA: String; let foodB: String; let status: String; let createdAt: String }
    struct ExperimentEntryBody: Encodable { let arm: String; let preGlucose: Int; let peakGlucose: Int }
    struct ExperimentEntryRecord: Decodable, Identifiable { let id: String; let arm: String; let preGlucose: Int; let peakGlucose: Int; let glucoseDelta: Int; let recordedAt: String }
    struct ExperimentComparison: Decodable {
        let experiment: ExperimentRecord
        let armA: [ExperimentEntryRecord]; let armB: [ExperimentEntryRecord]
        let avgDeltaA: Double?; let avgDeltaB: Double?
    }

    func createExperiment(name: String, foodA: String, foodB: String) async throws -> ExperimentRecord {
        try await request("POST", "/experiments", body: ExperimentBody(name: name, foodA: foodA, foodB: foodB))
    }

    func listExperiments() async throws -> [ExperimentRecord] {
        try await request("GET", "/experiments")
    }

    func getExperiment(id: String) async throws -> ExperimentComparison {
        try await request("GET", "/experiments/\(id)")
    }

    func addExperimentEntry(experimentId: String, arm: String, preGlucose: Int, peakGlucose: Int) async throws -> ExperimentEntryRecord {
        try await request("POST", "/experiments/\(experimentId)/entries", body: ExperimentEntryBody(arm: arm, preGlucose: preGlucose, peakGlucose: peakGlucose))
    }

    func completeExperiment(id: String) async throws {
        let _: [String: String] = try await request("POST", "/experiments/\(id)/complete")
    }

    // MARK: - Fasting

    struct FastingStartBody: Encodable { let targetHours: Double? }
    struct FastingSession: Decodable, Identifiable { let id: String; let startedAt: String; let endedAt: String?; let targetHours: Double?; let elapsedHours: Double }
    struct FastingActiveResponse: Decodable { let active: Bool? }

    func startFast(targetHours: Double?) async throws -> FastingSession {
        try await request("POST", "/fasting/start", body: FastingStartBody(targetHours: targetHours))
    }

    func endFast() async throws -> FastingSession {
        try await request("POST", "/fasting/end")
    }

    func getActiveFast() async throws -> FastingSession {
        try await request("GET", "/fasting/active")
    }

    func fastingHistory() async throws -> [FastingSession] {
        try await request("GET", "/fasting/history")
    }

    // MARK: - Medication Schedules

    struct MedScheduleBody: Encodable { let medicationName: String; let doseValue: Double; let doseUnit: String; let scheduleTime: String; let daysOfWeek: [Int] }
    struct MedScheduleRecord: Decodable, Identifiable { let id: String; let medicationName: String; let doseValue: Double; let doseUnit: String; let scheduleTime: String; let daysOfWeek: [Int]; let active: Bool }

    func createMedSchedule(name: String, doseValue: Double, doseUnit: String, time: String, days: [Int]) async throws -> MedScheduleRecord {
        try await request("POST", "/medication-schedules", body: MedScheduleBody(medicationName: name, doseValue: doseValue, doseUnit: doseUnit, scheduleTime: time, daysOfWeek: days))
    }

    func listMedSchedules() async throws -> [MedScheduleRecord] {
        try await request("GET", "/medication-schedules")
    }

    func deleteMedSchedule(id: String) async throws {
        let _: [String: String] = try await request("DELETE", "/medication-schedules/\(id)")
    }

    // MARK: - Export

    func exportCSV(fromDate: String? = nil, toDate: String? = nil) async throws -> Data {
        var path = "/export/csv"
        var params: [String] = []
        if let f = fromDate { params.append("from_date=\(f)") }
        if let t = toDate { params.append("to_date=\(t)") }
        if !params.isEmpty { path += "?" + params.joined(separator: "&") }

        guard let url = URL(string: baseURL + path) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = "GET"
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }

        let (data, response) = try await URLSession.shared.data(for: req)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status < 200 || status >= 300 { throw APIError.httpError(status, "Export failed") }
        return data
    }
}
