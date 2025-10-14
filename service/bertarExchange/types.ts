export interface CreateItemDto {
    title: string;
    description: string;
     itemType: string;
      productId: string;
      serviceId: string;
}
export interface Item {
    id: string;
    title: string;
    description: string;
    itemType: string;
    productId: string | null;
    serviceId: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}
