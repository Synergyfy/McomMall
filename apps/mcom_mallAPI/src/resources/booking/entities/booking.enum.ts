export enum BookingStatus {
  /** The booking has been created but not yet approved by the business. */
  PENDING = 'pending',
  /** The booking has been approved by the business. */
  APPROVED = 'approved',
  /** The customer has confirmed the booking (e.g., by paying). */
  CONFIRMED = 'confirmed',
  /** The booking has been declined by the business. */
  DECLINED = 'declined',
  /** The booking has been cancelled by the customer. */
  CANCELLED = 'cancelled',
  /** The service has been rendered and the booking is complete. */
  COMPLETED = 'completed',
}
