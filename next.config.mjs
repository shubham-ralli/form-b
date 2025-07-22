/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'bcryptjs', 
      'jsonwebtoken', 
      'mongodb', 
      '@mongodb-js/zstd',
      'snappy',
      'kerberos',
      'mongodb-client-encryption'
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
      
      // Exclude MongoDB and related packages from client bundle
      config.externals = config.externals || []
      config.externals.push({
        'mongodb': 'commonjs mongodb',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        'snappy': 'commonjs snappy',
        'kerberos': 'commonjs kerberos',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
        'gcp-metadata': 'commonjs gcp-metadata',
        'socks': 'commonjs socks',
        '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers'
      })
    }
    return config
  }
}

export default nextConfig
