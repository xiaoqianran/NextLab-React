/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages 项目站点部署在 /NextLab-React/ 子路径下，CI 构建时注入；
  // 本地不设此变量即为根路径。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};
export default nextConfig;
