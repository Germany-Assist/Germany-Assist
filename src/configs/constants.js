export const STRIPE_EVENTS = {
  PAYMENT_SUCCESS: "payment_intent.succeeded",
  PAYMENT_CREATED: "payment_intent.created",
  PAYMENT_FAILED: "payment_intent.payment_failed",
};
export const NOTIFICATION_EVENTS = {
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  COMMENT_CREATED: "COMMENT_CREATED",
  VERIFICATION_EMAIL_SENT: "VERIFICATION_EMAIL_SENT",
  VERIFICATION_ACCOUNT_RECEIVED: "VERIFICATION_ACCOUNT_RECEIVED",
};
export const AUDIT_LOGS_CONSTANTS = {
  ORDER_CREATE: "order.create",
  ORDER_UPDATE: "order.update",
  ORDER_CANCEL: "order.cancel",
  ACTOR_SYSTEM: "system",
  ACTOR_ADMIN: "admin",
  ACTOR_CLIENT: "client",
  ACTOR_PROVIDER: "provider",
};
