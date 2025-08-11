export const userPolicyTemplate = {
  version: "1.0",
  name: "user inline policy",
  description: "default",
  lastUpdate: Date.now(),
  statements: {
    clints: {
      business: {
        3: {
          coupon: {
            create: {
              allow: true,
            },
          },
        },
      },
      provider: {
        2: {},
      },
    },
    asset: {
      upload: {
        allow: true,
        // spaaces will be in megabytes
        spaceLimit: 10,
        maxMedia: {
          image: 0.4,
          vedio: 10,
        },
        mediaType: ["jpg", "png"],
      },
    },
    provider: {
      create: {
        allow: true,
        limit: 1,
        current: 0,
      },
    },
    business: {
      create: {
        allow: true,
        limit: 1,
        current: 0,
      },
    },
    review: {
      create: {
        allow: true,
      },
    },
  },
};
export const businessPolicyTemplate = {
  version: "1.0",
  name: "business policy",
  description: "default",
  lastUpdate: Date.now(),
  statements: {
    asset: {
      upload: {
        allow: true,
        users: [1, 2, 3],
        // spaaces will be in megabytes
        spaceLimit: 100,
        maxMedia: {
          image: 0.4,
          vedio: 10,
        },
        mediaType: ["*"],
      },
    },
    post: {
      create: {
        users: [1, 2, 3],
        allow: true,
      },
    },
    coupon: {
      create: {
        users: [1, 2, 3],
        allow: true,
      },
    },
  },
};
export const providerPolicyTemplate = {
  version: "1.0",
  name: "provider policy",
  description: "default",
  lastUpdate: Date.now(),
  statements: {
    asset: {
      upload: {
        allow: true,
        users: [],
        spaceLimit: 100,
        maxMedia: {
          image: 0.4,
          vedio: 10,
        },
        mediaType: ["*"],
      },
    },
    coupon: {
      create: {
        users: [],
        allow: true,
        // allow: false,
        // reason: "Exceeds business plan limits",
      },
    },
    services: {
      create: {
        allow: true,
      },
      update: {
        allow: true,
      },
    },
  },
};
