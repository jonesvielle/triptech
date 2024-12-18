/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        {
          loader: "file-loader",
          options: {
            outputPath: "static/fonts/",
            publicPath: "/fonts/",
          },
        },
      ],
    });

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
