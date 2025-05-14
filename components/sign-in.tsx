import navigationAuth from "@/app/data/navigation-authorized";
import { signIn } from "@/auth";
import React from "react";
import RoundedImage from "./rounded-image";

const SignIn: React.FC = () => {
  const home_item = navigationAuth.find((item) => item.name == "Hjem") || {
    name: "Hjem",
    link: "/",
  };
  const link = home_item.link;
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: link });
      }}
      className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center cursor-pointer bg-eo-blue text-background gap-2 hover:bg-[#85A2B7] mx-auto text-sm sm:text-base h-10 sm:h-12 px-1 sm:px-2 w-fit"
    >
      <button type="submit" className="flex items-center gap-2 w-full h-full">
        <div className="rounded-full bg-background p-1">
          <RoundedImage
            src="/assets/Google.png"
            alt="Google logo"
            height={30}
            width={30}
          />
        </div>
        <span className="font-semibold">Logg inn med Google</span>
      </button>
    </form>
  );
};

export default SignIn;
