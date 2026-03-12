import SwiftUI

struct ExportCard: View {
    @State private var fromDate = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()
    @State private var toDate = Date()
    @State private var exporting = false
    @State private var showShare = false
    @State private var exportedURL: URL?

    var body: some View {
        VCard {
            VStack(alignment: .leading, spacing: 0) {
                VLabelText(text: "Export Data")

                VLabelText(text: "From")
                    .padding(.top, 16)

                DatePicker("", selection: $fromDate, displayedComponents: .date)
                    .labelsHidden()
                    .tint(Color.vPrimary)
                    .padding(.top, 4)

                VLabelText(text: "To")
                    .padding(.top, 16)

                DatePicker("", selection: $toDate, displayedComponents: .date)
                    .labelsHidden()
                    .tint(Color.vPrimary)
                    .padding(.top, 4)

                Button {
                    exporting = true
                    Task {
                        let formatter = DateFormatter()
                        formatter.dateFormat = "yyyy-MM-dd"
                        let from = formatter.string(from: fromDate)
                        let to = formatter.string(from: toDate)

                        do {
                            let data = try await APIClient.shared.exportCSV(fromDate: from, toDate: to)
                            let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("verazoi-export.csv")
                            try data.write(to: tempURL)
                            exportedURL = tempURL
                            showShare = true
                        } catch {}
                        exporting = false
                    }
                } label: {
                    Text(exporting ? "Exporting..." : "Export CSV")
                        .font(.system(size: 12, weight: .medium))
                        .tracking(0.4)
                        .foregroundStyle(Color.vBackground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(exporting ? Color.vForeground.opacity(0.3) : Color.vForeground)
                }
                .disabled(exporting)
                .padding(.top, 20)
            }
        }
        .sheet(isPresented: $showShare) {
            if let url = exportedURL {
                ShareSheet(items: [url])
            }
        }
    }
}

private struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
