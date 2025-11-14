import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'thread-stream',
    'crypto-browserify',
    'stream-browserify',
    'process',
    '@libsql/client',
    '@libsql/hrana-client',
    'better-sqlite3',
    'drizzle-orm',
  ],
  // Ensure proper hydration
  experimental: {
    optimizePackageImports: [
      '@dynamic-labs/sdk-react-core',
      '@dynamic-labs/wagmi-connector',
    ],
  },
  trailingSlash: false,
};

export default nextConfig;
