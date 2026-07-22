import { withSentryConfig } from "@sentry/nextjs";

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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Upload source maps to Sentry so stack traces are readable, but never
  // serve them publicly - deleteSourcemapsAfterUpload (on by default) strips
  // them from the build output once the upload succeeds. When
  // SENTRY_AUTH_TOKEN is absent (e.g. forks/community PRs) we explicitly
  // disable the upload step so the build stays green instead of failing on
  // an auth error.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  webpack: {
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },
  },
});
