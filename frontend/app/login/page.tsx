import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import { basePath } from "@/lib/assets"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        <Image src={`${basePath}/images/verazoi_logo_top.svg`} alt="Verazoi" width={420} height={140} className="h-auto w-[180px]" />
        <LoginForm />
      </div>
    </div>
  )
}
