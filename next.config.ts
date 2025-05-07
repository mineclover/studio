
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Remains for static HTML export, root page will also be exported.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Add this line to disable Image Optimization for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Added for potential metadata images
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
    // For static export, if the default loader causes issues with certain deployment targets,
    // you might need to set unoptimized: true. However, for remotePatterns, it should generally work.
    // unoptimized: true, 
  },
};

export default nextConfig;
