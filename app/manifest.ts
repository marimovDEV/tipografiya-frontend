import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrintERP - Shop Floor Operations",
    short_name: "PrintERP",
    description: "Mobile-first shop floor operations management for printing and box manufacturing",
    start_url: "/shop-floor",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-narrow.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  }
}
