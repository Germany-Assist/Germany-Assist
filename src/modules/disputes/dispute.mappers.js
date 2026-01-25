export function toResponse(dispute) {
  return {
    id: dispute.id,
    orderId: dispute.orderId,
    openedBy: dispute.openedBy,
    reason: dispute.reason,
    description: dispute.description,
    status: dispute.status,
    resolution: dispute.resolution,
    resolvedAt: dispute.resolvedAt,
    createdAt: dispute.createdAt,
  };
}
