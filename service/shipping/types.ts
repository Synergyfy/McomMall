export interface ShippingAddress {
  id: string;
  addressName: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isMain: boolean;
  created_at?: string;
}

export interface CreateShippingAddressDto {
  addressName: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  isMain?: boolean;
}

export interface UpdateShippingAddressDto extends Partial<CreateShippingAddressDto> {}

export interface ShippingAddressListResponse {
  data: ShippingAddress[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
