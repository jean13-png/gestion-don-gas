/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // 10 photos de preuve x 5 Mo + marge pour les champs du formulaire
      bodySizeLimit: "52mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://cdnjs.cloudflare.com",
              "connect-src 'self' https: http: localhost:*",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            // SAMEORIGIN (et non DENY) pour permettre l'aperçu intégré des
            // attestations PDF (meme origine) tout en bloquant l'inclusion
            // par des sites tiers.
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
