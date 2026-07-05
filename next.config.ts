import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The service-worker script must never be served stale from any HTTP
        // cache (browser or CDN), or update detection breaks. Always revalidate.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    // Intuitive external/typed URLs that match visible labels but aren't real
    // routes. The app has NO broken internal links — these only catch inbound
    // links and users typing the obvious URL. Permanent (308) so search engines
    // transfer link value to the destination. Neither source is a real route.
    return [
      // Nav/footer label "Supplements" → the rankings hub lives at /rankings.
      { source: "/supplements", destination: "/rankings", permanent: true },
      // Footer "INFO" section heading → the info content lives at /about.
      { source: "/info", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
