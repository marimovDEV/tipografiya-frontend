/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/financial/:path*',
        destination: '/reports/',
        permanent: true,
      },
      {
        source: '/analytics/:path*',
        destination: '/reports-dashboard/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
