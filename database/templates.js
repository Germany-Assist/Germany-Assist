//this will be moved to the database but currently is here for speed of development
//however the mechanics of using it wont change since it will be loaded to the cache
export const roleTemplates = {
  // Business owner
  root_business: [
    // Assets
    { action: "create", resource: "asset" },
    { action: "update", resource: "asset" },
    { action: "delete", resource: "asset" },
    { action: "statistical", resource: "asset" },
    // Services
    { action: "create", resource: "service" },
    { action: "update", resource: "service" },
    { action: "delete", resource: "service" },
    { action: "publish", resource: "service" },
    { action: "unpublish", resource: "service" },
    { action: "statistical", resource: "service" },
    // Posts
    { action: "create", resource: "post" },
    { action: "update", resource: "post" },
    { action: "delete", resource: "post" },
    { action: "restore", resource: "post" },
    { action: "publish", resource: "post" },
    { action: "unpublish", resource: "post" },
    { action: "statistical", resource: "post" },

    // Permissions
    { action: "assign", resource: "permission" },
    { action: "revoke", resource: "permission" },
    { action: "list", resource: "permission" },

    // Business
    { action: "update", resource: "business" },
    { action: "delete", resource: "business" },

    // Users (reps)
    { action: "create", resource: "user" },
    { action: "read", resource: "user" },
    { action: "update", resource: "user" },
    { action: "delete", resource: "user" },
  ],

  // Business representative
  rep_business: [
    // Assets
    { action: "create", resource: "asset" },
    { action: "statistical", resource: "asset" },

    // Services
    { action: "create", resource: "service" },
    { action: "update", resource: "service" },
    { action: "statistical", resource: "service" },

    // Posts
    { action: "create", resource: "post" },
    { action: "update", resource: "post" },
    { action: "statistical", resource: "post" },

    // Users rep (their own account only, enforced by middleware)
    { action: "update", resource: "user" },
  ],

  // 🔹 Admin (system/business moderator)
  admin: [
    // Assets
    { action: "restore", resource: "asset" },
    { action: "statistical", resource: "asset" },

    // Contracts
    { action: "create", resource: "contract" },

    // Coupons
    { action: "create", resource: "coupon" },
    { action: "read", resource: "coupon" },
    { action: "deactivate", resource: "coupon" },

    // Services
    { action: "approve", resource: "service" },
    { action: "reject", resource: "service" },
    { action: "publish", resource: "service" },
    { action: "unpublish", resource: "service" },
    { action: "statistical", resource: "service" },
    { action: "restore", resource: "service" },

    // Posts
    { action: "approve", resource: "post" },
    { action: "reject", resource: "post" },
    { action: "statistical", resource: "post" },

    // Reviews
    { action: "delete", resource: "review" },

    // Business
    { action: "delete", resource: "business" },
    { action: "restore", resource: "business" },
    { action: "verify", resource: "business" },

    // Users
    { action: "create", resource: "user" },
    { action: "read", resource: "user" },
    { action: "update", resource: "user" },
    { action: "delete", resource: "user" },
    { action: "restore", resource: "user" },
    { action: "verify", resource: "user" },

    // Analytics
    { action: "view", resource: "analytics" },
  ],

  // 🔹 SuperAdmin (everything)
  superAdmin: [
    // Give them all permissions
    // (could just assign permissionsData instead of listing them)
    "*",
  ],

  // 🔹 Client (end-user)
  client: [
    // Reviews
    { action: "create", resource: "review" },
    { action: "update", resource: "review" },
    { action: "delete", resource: "review" },

    // Comments
    { action: "create", resource: "comment" },
    { action: "update", resource: "comment" },
    { action: "delete", resource: "comment" },

    // Coupons
    { action: "apply", resource: "coupon" },
  ],
};
