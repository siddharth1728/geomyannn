/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/route",
        destination: "/api/directions",
      },
    ];
  },
};

export default nextConfig;
