import { ImageResponse } from "next/og";

export const alt = "Temurjon Kholmirzaev portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const stars = [[860, 170, 7], [930, 130, 5], [990, 210, 6], [700, 330, 6], [760, 300, 5], [640, 370, 5], [520, 470, 6], [470, 430, 5], [580, 500, 5]];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0b1122", color: "#eceff6", padding: 80, flexDirection: "column", justifyContent: "flex-end" }}>
        {stars.map(([x, y, r], index) => (
          <div key={index} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "#f5b642", boxShadow: "0 0 24px 6px rgba(245,182,66,.45)" }} />
        ))}
        <div style={{ fontSize: 88, lineHeight: 1, letterSpacing: -2 }}>Temurjon Kholmirzaev</div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#97a1b8" }}>Agents, perception, and systems. Heading toward game AI.</div>
      </div>
    ),
    size,
  );
}
