import navigationAuth from "@/app/data/navigation-authorized";
import { signIn } from "@/auth"
import React from "react";

interface SignInProps {
  text: string;
  className?: string;
}
const SignIn: React.FC<SignInProps> = ({text, className}) => {
  const home_item = navigationAuth.find(item => item.name == 'Hjem') || {name: 'Hjem', link: '/'}
  const link = home_item.link
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google", {redirectTo: link})
      }}
    >
      <button type="submit" className={className}>{text}</button>
    </form>
  );
};

export default SignIn;
