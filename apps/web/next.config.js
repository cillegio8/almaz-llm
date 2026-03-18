/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (!dev) {
      // Disable filesystem cache to avoid large .pack files in CI/Cloudflare Pages
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
