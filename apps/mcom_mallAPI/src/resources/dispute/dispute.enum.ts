export enum DisputeStatus {
  NEW = 'new',
  UNDER_REVIEW = 'under_review',
  MEDIATED = 'mediated',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum DisputeReason {
  NOT_RECEIVED = 'not_received',
  NOT_AS_DESCRIBED = 'not_as_described',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  SELLER_UNRESPONSIVE = 'seller_unresponsive',
  OTHER = 'other',
}
