import Permission from "../models/permission.js";

const permissionsData = [
  // Asset permissions
  { action: "create", resource: "asset", description: "Create new assets" },
  { action: "read", resource: "asset", description: "View assets" },
  { action: "update", resource: "asset", description: "Modify assets" },
  { action: "delete", resource: "asset", description: "Remove assets" },
  {
    action: "restore",
    resource: "asset",
    description: "Restore deleted assets",
  },
  {
    action: "export",
    resource: "asset",
    description: "Export/download assets",
  },

  // Contract permissions
  { action: "create", resource: "contract", description: "Create contracts" },
  { action: "read", resource: "contract", description: "View contracts" },
  { action: "sign", resource: "contract", description: "Sign contracts" },
  {
    action: "terminate",
    resource: "contract",
    description: "Terminate contracts",
  },
  { action: "approve", resource: "contract", description: "Approve contracts" },
  { action: "reject", resource: "contract", description: "Reject contracts" },

  // Coupon permissions
  { action: "create", resource: "coupon", description: "Create coupons" },
  { action: "read", resource: "coupon", description: "View coupons" },
  { action: "apply", resource: "coupon", description: "Apply coupons" },
  {
    action: "deactivate",
    resource: "coupon",
    description: "Deactivate coupons",
  },
  { action: "approve", resource: "coupon", description: "Approve coupons" },
  { action: "reject", resource: "coupon", description: "Reject coupons" },

  // Service permissions
  { action: "create", resource: "service", description: "Create services" },
  { action: "read", resource: "service", description: "View services" },
  { action: "update", resource: "service", description: "Modify services" },
  { action: "delete", resource: "service", description: "Remove services" },
  { action: "publish", resource: "service", description: "Publish services" },
  {
    action: "unpublish",
    resource: "service",
    description: "Unpublish services",
  },
  { action: "approve", resource: "service", description: "Approve services" },
  { action: "reject", resource: "service", description: "Reject services" },

  // Review permissions
  { action: "create", resource: "review", description: "Create reviews" },
  { action: "read", resource: "review", description: "View reviews" },
  { action: "update", resource: "review", description: "Edit reviews" },
  { action: "delete", resource: "review", description: "Remove reviews" },
  { action: "moderate", resource: "review", description: "Moderate reviews" },

  // Post permissions
  { action: "create", resource: "post", description: "Create posts" },
  { action: "read", resource: "post", description: "View posts" },
  { action: "update", resource: "post", description: "Edit posts" },
  { action: "delete", resource: "post", description: "Remove posts" },
  { action: "publish", resource: "post", description: "Publish posts" },
  { action: "unpublish", resource: "post", description: "Unpublish posts" },
  { action: "moderate", resource: "post", description: "Moderate posts" },
  { action: "restore", resource: "post", description: "Restore deleted posts" },

  // Permission management
  {
    action: "assign",
    resource: "permission",
    description: "Assign permissions to roles",
  },
  {
    action: "revoke",
    resource: "permission",
    description: "Revoke permissions from roles",
  },
  {
    action: "list",
    resource: "permission",
    description: "List all permissions",
  },

  // Comment permissions
  { action: "create", resource: "comment", description: "Create comments" },
  { action: "read", resource: "comment", description: "View comments" },
  { action: "update", resource: "comment", description: "Edit comments" },
  { action: "delete", resource: "comment", description: "Delete comments" },
  { action: "moderate", resource: "comment", description: "Moderate comments" },

  // Business permissions
  { action: "create", resource: "business", description: "Create businesses" },
  { action: "read", resource: "business", description: "View businesses" },
  { action: "update", resource: "business", description: "Edit businesses" },
  { action: "delete", resource: "business", description: "Remove businesses" },
  {
    action: "restore",
    resource: "business",
    description: "Restore deleted businesses",
  },
  {
    action: "manage_users",
    resource: "business",
    description: "Manage business representatives",
  },

  // Analytics permissions
  {
    action: "view",
    resource: "analytics",
    description: "View analytics and reports",
  },
];

export default async function seedPermissions() {
  await Permission.bulkCreate(permissionsData);
}
