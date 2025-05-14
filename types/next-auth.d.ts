import { User as NextAuthUser } from "next-auth";
import { Session as NextAuthSession } from "next-auth";

// Extending the NextAuth `User` type to include `role`
declare module "next-auth" {
  interface User {
    role: string; // You can be more specific here by using your `Role` enum
  }

  interface Session {
    user: {
      name: string;
      image: string;
      given_name: string;
      family_name: string;
      email: string;
      role: string;
    };
  }
  interface JWT {
    role: string;
    email: string;
  }
}
