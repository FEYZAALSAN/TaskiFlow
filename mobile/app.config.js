const appJson = require("./app.json");

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "";
const usesHttp = apiUrl.startsWith("http://");

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      package: "com.meryemmm.taskiflowroot",
      versionCode: 1,
      usesCleartextTraffic: usesHttp,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "TaskiFlow profil fotoğrafınızı güncellemek için galeri erişimi ister.",
        },
      ],
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
      privacyPolicyUrl:
        process.env.EXPO_PUBLIC_PRIVACY_URL ||
        "https://taskiflow.com/privacy",
      supportEmail: "support@ndmsoftware.com",
    },
  },
};
