import { ImageResponse } from "next/og";

// Cartão de partilha usado pelo WhatsApp, Facebook, LinkedIn e afins.
// Gerado no servidor a partir das cores da marca — não há ficheiro a manter.
export const alt = "AutoRetoma — carros baratos, com o estado apresentado de forma transparente";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0F1B2D",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: "#F26A1B",
            }}
          />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#FFFFFF" }}>
            Auto<span style={{ color: "#F98B4C" }}>Retoma</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Carros baratos, sem
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            surpresas escondidas.
          </div>
          <div style={{ display: "flex", marginTop: 28, width: 120, height: 8, backgroundColor: "#F26A1B", borderRadius: 4 }} />
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#8FA6C8" }}>
          Retomas e carros de baixo valor, diretos do stand · autoretoma.pt
        </div>
      </div>
    ),
    size
  );
}
