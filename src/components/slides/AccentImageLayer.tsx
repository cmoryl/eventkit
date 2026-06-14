// Visual layer that paints a slide's optional `accentImage` overlay.
// Renders nothing if the slide has no accentImage configured, so it's safe
// to mount unconditionally over any existing slide renderer output.
//
// Positions (Gamma-style):
//   • background — full-bleed image behind everything, with an overlay style
//   • top / left / right — accent strip from that edge (≈ 35% of slide)
import React from "react";
import type { SlideData } from "./slideTypes";

type Position = NonNullable<SlideData["accentImage"]>["position"];
type Overlay = NonNullable<SlideData["accentImage"]>["overlay"];

const overlayCss = (style: Overlay, intensity: number): React.CSSProperties => {
  const a = Math.max(0, Math.min(1, intensity));
  switch (style) {
    case "frosted":
      return {
        backdropFilter: `blur(${24 * a}px) saturate(140%)`,
        background: `hsla(0, 0%, 100%, ${0.18 * a})`,
      };
    case "faded":
      return { background: `linear-gradient(180deg, hsla(0,0%,0%,${0.65 * a}) 0%, hsla(0,0%,0%,${0.25 * a}) 60%, hsla(0,0%,0%,${0.55 * a}) 100%)` };
    case "clear":
      return {};
    case "none":
    default:
      return { background: `hsla(0, 0%, 0%, ${0.35 * a})` };
  }
};

const positionStyle = (pos: Position): React.CSSProperties => {
  switch (pos) {
    case "background":
      return { inset: 0 };
    case "top":
      return { top: 0, left: 0, right: 0, height: "32%" };
    case "left":
      return { top: 0, bottom: 0, left: 0, width: "38%" };
    case "right":
      return { top: 0, bottom: 0, right: 0, width: "38%" };
    default:
      return { display: "none" };
  }
};

interface AccentImageLayerProps {
  slide: SlideData;
  /** When true (default), pointer-events stay off so the slide remains interactive. */
  passthrough?: boolean;
}

export const AccentImageLayer: React.FC<AccentImageLayerProps> = ({ slide, passthrough = true }) => {
  const a = slide.accentImage;
  if (!a || !a.url || !a.position || a.position === "none") return null;

  const focalX = typeof a.focalX === "number" ? a.focalX : 50;
  const focalY = typeof a.focalY === "number" ? a.focalY : 50;
  const intensity = typeof a.intensity === "number" ? a.intensity : 1;
  const isBackground = a.position === "background";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        zIndex: isBackground ? 0 : 25,
        pointerEvents: passthrough ? "none" : "auto",
        overflow: "hidden",
        ...positionStyle(a.position),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${JSON.stringify(a.url).slice(1, -1)})`,
          backgroundSize: "cover",
          backgroundPosition: `${focalX}% ${focalY}%`,
        }}
      />
      <div style={{ position: "absolute", inset: 0, ...overlayCss(a.overlay ?? "none", intensity) }} />
    </div>
  );
};

export default AccentImageLayer;
