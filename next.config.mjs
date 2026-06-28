/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint is run separately via `npm run lint`. We don't want a stray lint
  // warning to break `next build` for someone evaluating the project.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
