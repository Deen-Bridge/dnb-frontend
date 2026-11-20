const profileDefaults = {
  development: {
    bundleIdentifier: "com.deenbridge.app.dev",
    package: "com.deenbridge.app.dev",
  },
  preview: {
    bundleIdentifier: "com.deenbridge.app.preview",
    package: "com.deenbridge.app.preview",
  },
  production: {
    bundleIdentifier: "com.deenbridge.app",
    package: "com.deenbridge.app",
  },
};

module.exports = ({ config }) => {
  const profile = process.env.APP_ENV || "development";
  const identifiers = profileDefaults[profile] || profileDefaults.development;

  return {
    ...config,
    owner: process.env.EXPO_OWNER || config.owner,
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER || identifiers.bundleIdentifier,
    },
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE || identifiers.package,
    },
    extra: {
      ...config.extra,
      appEnvironment: profile,
    },
  };
};
