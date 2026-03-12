import Foundation
import Observation

@Observable
final class AuthState {
    var isAuthenticated = false
    var token: String?
    var email: String?
    var isLoading = false
    var error: String?

    private let tokenKey = "verazoi_token"
    private let emailKey = "verazoi_email"

    init() {
        if let saved = UserDefaults.standard.string(forKey: tokenKey) {
            token = saved
            email = UserDefaults.standard.string(forKey: emailKey)
            isAuthenticated = true
            Task { await APIClient.shared.setToken(saved) }
        }
    }

    func login(email: String, password: String) async {
        isLoading = true
        error = nil
        do {
            let t = try await APIClient.shared.login(email: email, password: password)
            token = t
            self.email = email
            isAuthenticated = true
            UserDefaults.standard.set(t, forKey: tokenKey)
            UserDefaults.standard.set(email, forKey: emailKey)
        } catch let e as APIError {
            switch e {
            case .httpError(_, let detail): error = detail
            default: error = "Connection failed"
            }
        } catch {
            self.error = "Connection failed"
        }
        isLoading = false
    }

    func register(email: String, password: String) async {
        isLoading = true
        error = nil
        do {
            let t = try await APIClient.shared.register(email: email, password: password)
            token = t
            self.email = email
            isAuthenticated = true
            UserDefaults.standard.set(t, forKey: tokenKey)
            UserDefaults.standard.set(email, forKey: emailKey)
        } catch let e as APIError {
            switch e {
            case .httpError(_, let detail): error = detail
            default: error = "Connection failed"
            }
        } catch {
            self.error = "Connection failed"
        }
        isLoading = false
    }

    func logout() {
        token = nil
        email = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: tokenKey)
        UserDefaults.standard.removeObject(forKey: emailKey)
        Task { await APIClient.shared.setToken(nil) }
    }
}
