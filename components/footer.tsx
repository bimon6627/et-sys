import Image from "next/image";
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full flex flex-col flex-wrap items-center justify-center bg-eo-gray custom-footer mt-auto py-10">
    <Link href="https://bawm.no">
        <Image className="invert" src="/assets/Logo.png"
          alt="Bawm logo"
          width={100}
          height={20}
        />
      </Link>
      <p>Opphavsrett © Birk Monsen 2025</p>
      <Link href="/personvern">Personvernerklæring</Link>
    </footer>
  );
}
