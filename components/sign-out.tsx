import navigation from "@/app/data/navigation-public";
import { signOut } from "@/auth"
import React from "react";

interface SignOutProps {
    text: string;
    className?: string;
}
const SignOut: React.FC<SignOutProps> = ({text, className}) => {
    const home_item = navigation.find(item => item.name == 'Hjem') || {name: 'Hjem', link: '/'}
    const link = home_item.link
    return (
        <form
        action={async () => {
            "use server"
            await signOut({redirectTo: link})
        }}
        >
        <button type="submit" className={className}>{text}</button>
        </form>
    );
};

export default SignOut;