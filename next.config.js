/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: monorepo/lockfiles can confuse Next workspace root inference.
  // Force the project root so routes like /qr/[token] resolve correctly in dev/build.
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;