import SwiftUI

struct LoginView: View {
    @Environment(AuthState.self) private var auth
    @State private var email = ""
    @State private var password = ""
    @State private var isRegistering = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 8) {
                Text("Verazoi")
                    .font(.vSerif(40))
                    .foregroundStyle(Color.vForeground)

                Text("METABOLIC INTELLIGENCE")
                    .font(.system(size: 10, weight: .medium))
                    .tracking(4)
                    .foregroundStyle(Color.vMutedForeground)
            }

            VStack(spacing: 16) {
                VStack(spacing: 12) {
                    TextField("Email", text: $email)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .font(.system(size: 14))
                        .foregroundStyle(Color.vForeground)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 0)
                                .stroke(Color.vBorder, lineWidth: 0.5)
                        )

                    SecureField("Password", text: $password)
                        .textContentType(isRegistering ? .newPassword : .password)
                        .font(.system(size: 14))
                        .foregroundStyle(Color.vForeground)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .overlay(
                            RoundedRectangle(cornerRadius: 0)
                                .stroke(Color.vBorder, lineWidth: 0.5)
                        )
                }

                if let error = auth.error {
                    Text(error)
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vAmber)
                }

                Button {
                    Task {
                        if isRegistering {
                            await auth.register(email: email, password: password)
                        } else {
                            await auth.login(email: email, password: password)
                        }
                    }
                } label: {
                    Group {
                        if auth.isLoading {
                            ProgressView()
                                .tint(Color.vBackground)
                        } else {
                            Text(isRegistering ? "Create account" : "Sign in")
                                .font(.system(size: 13, weight: .medium))
                                .tracking(0.5)
                        }
                    }
                    .foregroundStyle(Color.vBackground)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(isFormValid ? Color.vForeground : Color.vForeground.opacity(0.3))
                }
                .disabled(!isFormValid || auth.isLoading)

                Button {
                    isRegistering.toggle()
                    auth.error = nil
                } label: {
                    Text(isRegistering ? "Already have an account? Sign in" : "Create an account")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.vPrimary)
                }
            }
            .padding(.top, 48)
            .padding(.horizontal, 32)

            Spacer()
            Spacer()
        }
        .background(Color.vBackground)
    }

    private var isFormValid: Bool {
        email.contains("@") && password.count >= 8
    }
}
