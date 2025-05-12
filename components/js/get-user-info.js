import { auth } from "@/auth";

export default async function GetUserInfo() {
  const session = await auth();
  const user = session?.user;

  return { ...user };
}
