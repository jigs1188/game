// metro.config.js
module.exports = {
    resolver: {
      sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    },
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
  };