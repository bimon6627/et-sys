import { auth } from "@/auth"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <img src={session.user.image ?? '/assets/default-profile.png'} alt="User Avatar" />
  )
}