const appJson = require('./app.json').expo;

module.exports = () => ({
  expo: {
    ...appJson,
    android: {
      ...appJson.android,
      config: {
        ...appJson.android.config,
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
        },
      },
    },
  },
});
