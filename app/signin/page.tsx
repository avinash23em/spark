import { SignIn } from "@/components/auth/sign-in"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">IdeaSpark Mind Mapper</h1>
          <p className="mt-2 text-gray-600">Sign in to start mapping your ideas</p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
