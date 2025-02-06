import { auth } from "@/auth"
 
export default async function GetUserAvatarSrc() {
  const session = await auth()
 
  if (!session?.user) return '/assets/default-profile.png';
 
  return (session.user.image ?? '/assets/default-profile.png');
}