import Image from "next/image";
export default function Footer() {
    return(
        <footer className="bottom-0 w-full flex flex-col flex-wrap items-center justify-center bg-eo-gray custom-footer mt-5 py-10">
                <div className="flex items-center justify-center rounded-full pr-4 pl-3 py-1 bg-background">
                    <a href="/"><Image src={'/assets/ETsysFull.png'} width={250} height={33} alt="Elevtingssystemet" /></a>
                    </div>
                <p>Opphavsrett © Birk Monsen 2025</p>
        </footer>
    );
};