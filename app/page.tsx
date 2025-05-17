import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MindMapHome } from "@/components/mind-map-home"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/signin")
  }

  return <MindMapHome />
}
