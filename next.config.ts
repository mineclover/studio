import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Added for static HTML export
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
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
