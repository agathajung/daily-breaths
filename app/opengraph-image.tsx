import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "호흡의 하루 · Daily Breaths, Mindful Thoughts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEXT_FOR_FONT = "호흡의 하루마음흐름결모은";

async function loadGoogleFont(family: string, weight: number) {
  // CSS1 API + old User-Agent forces TTF response. next/og (Satori) requires
  // TTF/OTF — the default css2 endpoint only returns woff2 which Satori can't
  // parse ("Unsupported OpenType signature wOF2").
  const url = `https://fonts.googleapis.com/css?family=${family}:${weight}&text=${encodeURIComponent(
    TEXT_FOR_FONT
  )}`;
  try {
    const css = await (
      await fetch(url, { headers: { "User-Agent": "curl/7.0" } })
    ).text();
    const m = css.match(/src:\s*url\((https:[^)]+)\)\s*format\('truetype'\)/);
    if (!m) return null;
    return await (await fetch(m[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const serifFont = await loadGoogleFont("Noto+Serif+KR", 500);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#efe9dc",
          color: "#1b1610",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            color: "#8a7d6a",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          <span>BREATH</span>
          <span
            style={{
              display: "flex",
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#8a4a2a",
              margin: "0 14px",
            }}
          />
          <span>호흡</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 192,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#1b1610",
              fontFamily: serifFont ? "NotoSerifKR" : "serif",
            }}
          >
            호흡의 하루
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 32,
              color: "#3d342a",
              fontStyle: "italic",
              letterSpacing: "0.02em",
            }}
          >
            Daily Breaths, Mindful Thoughts
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#8a7d6a",
          }}
        >
          <span
            style={{
              fontFamily: serifFont ? "NotoSerifKR" : "serif",
            }}
          >
            한 호흡, 한 줄의 마음
          </span>
          <span style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>
            anonymous
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serifFont
        ? [
            {
              name: "NotoSerifKR",
              data: serifFont,
              style: "normal",
              weight: 500,
            },
          ]
        : [],
    }
  );
}
