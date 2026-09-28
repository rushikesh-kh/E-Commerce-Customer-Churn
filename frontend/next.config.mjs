/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export lets FastAPI serve the built frontend as plain files,
  // so the whole app deploys as a single Render web service.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
