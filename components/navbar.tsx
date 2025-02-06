import navigation from "@/app/data/navigation-public";
import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="bg-background mt-5 w-full h-fit">
            <ul className="flex justify-center space-x-4">
                {navigation.map((item, index) => (
                    <li key={index}>
                        <Link href={item.link} className="text-foreground hover:text-eo-orange">{item.name}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}