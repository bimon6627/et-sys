type RoundedImageProps = {
  src: string;
  alt: string;
  height?: number;
  width?: number;
  className?: string;
};

export default function RoundedImage({
  src,
  alt,
  height,
  width,
  className = "",
}: RoundedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      height={height}
      width={width}
      className={`rounded-full aspect-square object-cover ${className}`}
    />
  );
}
