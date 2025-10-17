//this will be moved to the database but currently is here for speed of development
//however the mechanics of using it wont change since it will be loaded to the cache
export const roleTemplates = {
  employer_root: [
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

    // serviceProvider
    { action: "update", resource: "serviceProvider" },
    { action: "delete", resource: "serviceProvider" },

    // Users (reps)
    { action: "create", resource: "user" },
    { action: "read", resource: "user" },
    { action: "update", resource: "user" },
    { action: "delete", resource: "user" },
  ],
  // serviceProvider representative
  employer_rep: [
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
  // serviceProvider owner
  service_provider_root: [
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

    // offer
    { action: "create", resource: "offer" },
    { action: "withdraw", resource: "offer" },
    // order
    { action: "create", resource: "order" },

    // serviceProvider
    { action: "update", resource: "serviceProvider" },
    { action: "delete", resource: "serviceProvider" },

    // Users (reps)
    { action: "create", resource: "user" },
    { action: "read", resource: "user" },
    { action: "update", resource: "user" },
    { action: "delete", resource: "user" },
  ],
  // serviceProvider representative
  service_provider_rep: [
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

    // offer
    { action: "create", resource: "offer" },
    { action: "withdraw", resource: "offer" },
    // order
    { action: "create", resource: "order" },

    // Users rep (their own account only, enforced by middleware)
    { action: "update", resource: "user" },
  ],

  // 🔹 Admin (system/serviceProvider moderator)
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

    // serviceProvider
    { action: "delete", resource: "serviceProvider" },
    { action: "restore", resource: "serviceProvider" },
    { action: "verify", resource: "serviceProvider" },

    // Users
    { action: "create", resource: "user" },
    { action: "read", resource: "user" },
    { action: "update", resource: "user" },
    { action: "delete", resource: "user" },
    { action: "restore", resource: "user" },
    { action: "verify", resource: "user" },
    { action: "create", resource: "category" }, //ownership:root //super:admin,superAdmin
    { action: "update", resource: "contract" }, //ownership:root //super:admin,superAdmin
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

export const contractTemplates = {
  visaPaperworkContract: {
    contract_template: `
# Visa & Work Permit Agreement
**Agreement between:**

1. **Service Provider:**

* Name : {{service_provider_name}}
* Email : {{service_provider_email}}
* Phone Number : {{service_provider_number}}
* ID : {{service_provider_id}}

2. **Client:**
* Name : {{client_first_name}} {{client_last_name}}
* Email : {{client_email}}
* Phone Number : {{client_phone_number}}

---

## 1. Introduction

This Visa & Work Permit Agreement defines the terms and conditions under which the Agency will provide visa and work permit processing services for the Client.
Regarding the following Service :

**SERVICE**

* Title : {{service_title}}
* Id : {{service_id}}

---

## 2. Scope of Services

The Agency agrees to assist the Client in the preparation and submission of all required documentation to obtain a work visa and/or permit. Services include:

- Completion of application forms  
- Appointment scheduling  
- Document verification  
- Submission and communication with relevant authorities
---

## 3. Client Obligations
The Client must provide accurate, truthful, and complete information, and submit all necessary documents promptly.  
The Agency is **not responsible** for delays or rejections caused by incorrect or incomplete information from the Client.

---

## 4. Service Fees
- Total Service Fee: **{{price}} {{currency}}**  

> Note: The fee covers only the Agency’s service. All official government, embassy, or courier fees are excluded unless explicitly stated.

---

## 5. Processing Time
The estimated processing time is **{{processing_days}} business days** from the date all required documents are received.  
Processing time may vary due to embassy workload, holidays, or other factors beyond the Agency’s control.

---

## 6. Refund Policy
No refunds will be issued after submission of the application to the authorities.  
Refunds may be considered only in exceptional cases at the Agency's discretion.

---

## 7. Confidentiality
Both parties agree to maintain strict confidentiality regarding all personal information and documentation exchanged during the visa application process.

---

## 8. Terms & Conditions
The Agency acts solely as an intermediary and cannot guarantee visa approval.  
The Client acknowledges that final approval rests entirely with the embassy or immigration authorities.

---

## 9. Extra Points
- {{extra_point_1}}  
- {{extra_point_2}}  
- {{extra_point_3}}
---
**Signed on:** {{agreement_date}}  

`,
    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
  },
};
