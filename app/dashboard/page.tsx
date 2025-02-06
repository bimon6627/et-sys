import React from "react";
import UserAvatar from "@/components/user-avatar";
import SignOut from "@/components/sign-out";

export default function Dashboard() {
    return (
        <div>
            <div>Hey there!!!</div>
            <UserAvatar />
            <SignOut text="Sign out"/>
        </div>
    )
}