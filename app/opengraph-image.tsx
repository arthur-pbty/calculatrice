import { ImageResponse } from "next/og";

/**
 * Image Open Graph générée dynamiquement par Next.js.
 * Sert d'image de prévisualisation quand le lien est partagé
 * sur les réseaux sociaux, Google Discover, etc.
 *
 * Accessible à /opengraph-image.png
 */

export const runtime = "edge";
export const alt =
  "Calculatrice en ligne gratuite – Interface moderne avec mode scientifique";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1e2e 0%, #0f0f1a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Icône calculatrice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            marginBottom: 32,
            fontSize: 64,
            color: "white",
            fontWeight: 700,
          }}
        >
          =
        </div>

        {/* Titre */}
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#818cf8" }}>Calc</span>
          <span>ulatrice en ligne</span>
        </div>

        {/* Sous-titre */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          Simple & Scientifique • 100 % gratuite
        </div>

        {/* Tags de fonctionnalités */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["sin cos tan", "log √ xⁿ", "π e n!", "Historique"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                background: "rgba(129, 140, 248, 0.15)",
                color: "#818cf8",
                fontSize: 20,
                fontWeight: 500,
                border: "1px solid rgba(129, 140, 248, 0.3)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
