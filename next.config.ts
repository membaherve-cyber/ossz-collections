import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  // Vercel serverless functions include only traced files. The auto-setup logic
  // needs the seed scripts, schema SQL and catalogue images available at
  // runtime; include them explicitly so an empty production DB can self-heal.
  outputFileTracingIncludes: {
    "/*": ["./scripts/**/*", "./public/catalogue/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Source photography is at most ~1600px wide, so generating 2048/3840
    // variants only upscales and wastes bytes on the very connections we
    // care about. Cap the ladder at sensible retina widths.
    deviceSizes: [360, 480, 640, 828, 1080, 1440, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    // Editorial photography tolerates a lower quality floor than the default 75
    // with no visible loss, and it is the single biggest byte saving on mobile.
    // 90 is reserved for hero/editorial banner photography where compression
    // artefacts are visible; the rest of the catalogue stays on the cheap ladder.
    qualities: [58, 65, 75, 90],
    // Remote editorial images are immutable once published.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        // Long-lived immutable caching for the optimised image responses.
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        // The worker must be served from the root scope and never cached.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          /**
           * No framing restriction by default.
           *
           * Preview and embed tools host the site in a cross-origin iframe, and
           * their origin is not knowable from here — an allowlist guesses wrong
           * and blanks the page. Clickjacking hardening is therefore opt-in at
           * deploy time: set FRAME_ANCESTORS="'self'" (or your own allowlist)
           * once the production domain is fixed.
           */
          ...(process.env.FRAME_ANCESTORS
            ? [
                {
                  key: "Content-Security-Policy",
                  value: `frame-ancestors ${process.env.FRAME_ANCESTORS}`,
                },
              ]
            : []),
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
