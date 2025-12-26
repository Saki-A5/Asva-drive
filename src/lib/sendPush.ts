import admin from "@/lib/firebaseAdmin";

type SendPushParams = {
  tokens: string[] | string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export const sendPush = async ({
  tokens,
  title,
  body,
  data = {},
}: SendPushParams) => {
  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];

  if (tokenArray.length === 0) return;

  const message: admin.messaging.MulticastMessage = {
    tokens: tokenArray,
    notification: {
      title,
      body,
    },
    data,
    webpush: {
      notification: {
        icon: "/icons/icon-192x192.png", // icon for web push. you can customize it
        badge: "/icons/badge.png", // badge for Android. you can customize it
      },
      fcmOptions: {
        link: "/", // open app when clicked
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);

    // Optional: cleanup invalid tokens
    const invalidTokens: string[] = [];

    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const errorCode = res.error?.code;
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokenArray[idx]);
        }
      }
    });

    return { successCount: response.successCount, invalidTokens };
  } catch (error) {
    console.error("❌ FCM send error:", error);
    throw error;
  }
};
