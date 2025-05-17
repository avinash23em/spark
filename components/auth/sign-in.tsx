"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FcGoogle } from "react-icons/fc"
import { useToast } from "@/components/ui/use-toast"

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)

    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      toast({
        title: "Error signing in with Google",
        description: "An error occurred while signing in with Google.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to access your mind maps and ideas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          type="button"
          className="w-full h-12"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          {isLoading ? "Signing in..." : "Sign In with Google"}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
      </CardFooter>
    </Card>
  )
}
