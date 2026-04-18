import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // When a request hits the agora.consultthedead.com subdomain,
        // serve the /agora route as the index. The marketing landing
        // page stays at consultthedead.com.
        {
          source: "/",
          has: [
            {
              type: "host",
              value: "agora.consultthedead.com",
            },
          ],
          destination: "/agora",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
