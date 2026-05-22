import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },       // Spotify artist images
      { protocol: 'https', hostname: '*.supabase.co' },   // Supabase storage
      { protocol: 'https', hostname: 'mosaic.scdn.co' },  // Spotify mosaic images
    ],
  },
}

export default nextConfig
