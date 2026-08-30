import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "St.Mark Borg El Arab Cantine",
    short_name: "St.Mark POS",
    description: "Camp canteen point of sale",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ee",
    theme_color: "#c2703d",
    icons: [
      { src: "/next.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
