export type MerchantGiftCard = {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  initialBalance: string;
  currentBalance: string;
  currency: string;
  isActive: boolean;
  expiryDate: string | null;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderEmail: string | null;
  personalMessage: string;
  deliveryDate: string;
  deliveryStatus: string;
  ownerId: string;
  purchaserId: string;
  purchaseBusinessId: string;
  templateId: string;
  purchaseOrderId: string;
  deletedAt: string | null;
};

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export type GetMerchantGiftCardsResponse = {
  data: MerchantGiftCard[];
  meta: PaginationMeta;
};