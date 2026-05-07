import SwiftUI

struct LoginView: View {
    private enum Field {
        case email
        case password
    }

    @Environment(AuthState.self) private var auth
    @Environment(\.design) private var design
    @State private var email = ""
    @State private var password = ""
    @State private var isRegistering = false
    @State private var showForgotPassword = false
    @State private var resetEmail = ""
    @FocusState private var focusedField: Field?

    var body: some View {
        GeometryReader { proxy in
            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: 24)

                    VStack(spacing: 12) {
                        Image("VerazoiLogoFull")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 200)

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
                                .submitLabel(.next)
                                .focused($focusedField, equals: .email)
                                .font(.system(size: 14))
                                .foregroundStyle(Color.vForeground)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .overlay(
                                    RoundedRectangle(cornerRadius: design.buttonRadius)
                                        .stroke(Color.vBorder, lineWidth: 0.5)
                                )

                            SecureField("Password", text: $password)
                                .textContentType(isRegistering ? .newPassword : .password)
                                .submitLabel(.go)
                                .focused($focusedField, equals: .password)
                                .font(.system(size: 14))
                                .foregroundStyle(Color.vForeground)
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .overlay(
                                    RoundedRectangle(cornerRadius: design.buttonRadius)
                                        .stroke(Color.vBorder, lineWidth: 0.5)
                                )
                        }

                        if let error = auth.error {
                            Text(error)
                                .font(.system(size: 12))
                                .foregroundStyle(Color.vAmber)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Button(action: submit) {
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
                            .clipShape(RoundedRectangle(cornerRadius: design.buttonRadius))
                        }
                        .disabled(!isFormValid || auth.isLoading)

                        Button {
                            isRegistering.toggle()
                            auth.error = nil
                            focusedField = nil
                        } label: {
                            Text(isRegistering ? "Already have an account? Sign in" : "Create an account")
                                .font(.system(size: 12))
                                .foregroundStyle(Color.vPrimary)
                        }

                        if !isRegistering {
                            Button {
                                resetEmail = email
                                showForgotPassword = true
                                focusedField = nil
                            } label: {
                                Text("Forgot password?")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.vMutedForeground)
                            }
                            .padding(.top, 4)
                        }

                        #if DEBUG
                        Button {
                            auth.applyDemoSession()
                        } label: {
                            Text("Preview with demo data")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.vMutedForeground.opacity(0.7))
                                .underline()
                        }
                        .padding(.top, 8)
                        #endif
                    }
                    .padding(.top, 48)

                    Spacer(minLength: 24)
                }
                .frame(minHeight: proxy.size.height)
                .padding(.horizontal, 32)
                .padding(.vertical, 24)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .background(Color.vBackground)
        .onSubmit {
            switch focusedField {
            case .email:
                focusedField = .password
            case .password:
                if isFormValid {
                    submit()
                }
            case nil:
                break
            }
        }
        .alert("Reset password", isPresented: $showForgotPassword) {
            TextField("Email", text: $resetEmail)
                .textContentType(.emailAddress)
                .textInputAutocapitalization(.never)
            Button("Send reset link") {
                Task { await auth.forgotPassword(email: resetEmail) }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Enter your email to receive a password reset link.")
        }
    }

    private var isFormValid: Bool {
        email.contains("@") && password.count >= 8
    }

    private func submit() {
        guard isFormValid, !auth.isLoading else { return }
        focusedField = nil
        Task {
            if isRegistering {
                await auth.register(email: email, password: password)
            } else {
                await auth.login(email: email, password: password)
            }
        }
    }
}
