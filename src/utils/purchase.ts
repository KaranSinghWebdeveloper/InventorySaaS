import { PurchaseStatus } from "@prisma/client";

export const getNextPurchaseNumber = (purchaseIdSeed?: number) => {
  if (purchaseIdSeed) {
    return `PO-${String(purchaseIdSeed).padStart(6, "0")}`;
  }

  return `PO-${Date.now()}`;
};

export const isPurchaseLocked = (status: PurchaseStatus) =>
  status === PurchaseStatus.RECEIVED || status === PurchaseStatus.VERIFIED;

export const allowedPurchaseTransitions: Record<PurchaseStatus, PurchaseStatus[]> = {
  SAVE_DRAFT: [PurchaseStatus.SENT, PurchaseStatus.PENDING_CONFIRM, PurchaseStatus.RECEIVED],
  SENT: [PurchaseStatus.SAVE_DRAFT, PurchaseStatus.PENDING_CONFIRM, PurchaseStatus.RECEIVED],
  PENDING_CONFIRM: [PurchaseStatus.SENT, PurchaseStatus.RECEIVED],
  RECEIVED: [PurchaseStatus.VERIFIED],
  VERIFIED: []
};
