/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "i.ibb.co",
      "media.istockphoto.com",
      "images.unsplash.com",
      "res.cloudinary.com",
      "cdn.pixabay.com",
      "logo.clearbit.com",
    ],
  },
  webpack: (config) => {
    // pdfjs-dist optionally requires the native "canvas" package, which is
    // not installed; stub it out so the server bundle builds.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
