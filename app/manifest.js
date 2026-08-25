export default function manifest() {
  return {
    name: "Deen Bridge — Authentic Islamic Education",
    short_name: "DeenBridge",
    description:
      "Authentic Islamic education — courses, books, community, and mentorship, with payments on Stellar.",
    start_url: "/dashboard",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "natural",
    background_color: "#092601",
    theme_color: "#092601",
    categories: ["education", "books", "religion"],
    lang: "en",
    scope: "/",
    id: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    prefer_related_applications: false,
    edge_side_panel: {
      preferred_width: 480,
    },
  };
}
