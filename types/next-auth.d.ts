// types/next-auth.d.ts
import { Session } from "next-auth";
import { User as AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
  // Extend the Session type
  interface Session {
    user: {
      id: string;
      firstname: string;
      lastname: string;
      email: string;
      image: string;
      name: string;
    } & AdapterUser; // Allow AdapterUser fields
  }

  // Extend the User type
  interface User {
    id: string;
    firstname: string;
    lastname: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    firstname: string;
    lastname: string;
  }
}
