/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // 静的HTML出力
  trailingSlash: true,       // GitHub Pages用スラッシュ追加
  basePath: '/manufacturing-app-ver3', // リポジトリ名に合わせて追加
  images: { unoptimized: true }, // next/image を静的対応
}
module.exports = nextConfig
