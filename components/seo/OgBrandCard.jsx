/**
 * Shared social-card layout used by the dynamic opengraph-image / twitter-image
 * routes. Kept to the subset of CSS that Satori (next/og) can render.
 */
export function OgBrandCard({ title, subtitle, badge, typeLabel = "DEEN BRIDGE" }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #092601 0%, #0d3d16 55%, #1a7a2e 100%)",
        fontFamily: "sans-serif",
        padding: 60,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          color: "#86efac",
          fontSize: 26,
          fontWeight: 700,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 9999,
            background: "#22c55e",
            marginRight: 12,
          }}
        />
        {typeLabel}
      </div>
      <div
        style={{
          marginTop: 44,
          color: "#ffffff",
          fontSize: 52,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.15,
          maxWidth: 960,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 24,
            color: "#d1fae5",
            fontSize: 28,
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          {subtitle}
        </div>
      ) : null}
      {badge ? (
        <div
          style={{
            marginTop: 36,
            paddingTop: 12,
            paddingBottom: 12,
            paddingLeft: 28,
            paddingRight: 28,
            borderRadius: 9999,
            background: "#22c55e",
            color: "#052e16",
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
}

export default OgBrandCard;