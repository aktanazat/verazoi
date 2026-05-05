const DEFAULT_DEV_API_BASE = "http://localhost:8000/api/v1"

export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL
  if (configured) return configured.replace(/\/$/, "")

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL must be set for production builds")
  }

  return DEFAULT_DEV_API_BASE
}

export const API_BASE = getApiBase()
