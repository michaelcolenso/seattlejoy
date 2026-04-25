import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['leaflet', 'esri-leaflet'],
};

export default nextConfig;
