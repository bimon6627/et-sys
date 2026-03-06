import BwipJs from "@bwip-js/node";

export default function getDatamatrix(text: string) {
  const svg = BwipJs.toSVG({
    bcid: "datamatrix",
    text: text,
    scale: 3,
    textxalign: "center",
    textcolor: "000000",
    backgroundcolor: "ffffff",
  });
  const encodedSvg = encodeURIComponent(svg);
  const dataUri = `data:image/svg+xml;utf8,${encodedSvg}`;
  return dataUri;
}
