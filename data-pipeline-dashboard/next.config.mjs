/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ["147.93.67.102", "localhost:5173", "0.0.0.0:3000"]
  },
}

export default nextConfig
