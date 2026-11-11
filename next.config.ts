import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fonts for the Pinterest cost-sheet images rendered on demand (src/lib/og/costCard.tsx)
  outputFileTracingIncludes: { "/pin/[...path]": ["./src/lib/og/fonts/*"] },
};

export default nextConfig;
