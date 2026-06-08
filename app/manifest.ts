import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gorilla Fuel — Supplement & Food Intelligence",
    short_name: "Gorilla Fuel",
    description:
      "Scan it. Score it. Know what you're putting in your body. The no-BS supplement and food intelligence brand from the Gorilla Sports ecosystem.",
    start_url: "/",
    display: "standalone",
    background_color: "#060500",
    theme_color: "#ffd700",
    icons: [
      { src: "/gorilla-fuel-icon.png", sizes: "192x192", type: "image/png" },
      { src: "/gorilla-fuel-icon.png", sizes: "512x512", type: "image/png" },
      { src: "/gorilla-fuel-icon.png", sizes: "1024x1024", type: "image/png" },
      { src: "/gorilla-fuel-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
