import Image from "next/image";
type RoundedImageProps = {
    src: string;
    alt: string;
    height: number;
    width: number;
}
export default function RoundedImage({ src, alt, height, width }: RoundedImageProps) {
    return (
        <>
            <Image src={src} alt={alt} height={height} width={width} className="rounded-full aspect-square object-cover"></Image>
        </>
    );
};