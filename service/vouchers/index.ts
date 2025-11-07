import api from '../api';
import {
  CreateVoucherProductDto,
  VoucherProduct,
  Voucher,
  InitiateReloadDto,
  VerifyReloadDto,
  UpdateVoucherProductDto,
  InitiateVoucherPurchaseDto,
  VerifyVoucherPurchaseDto,
  RedeemVoucherDto,
} from './types';

export const getVoucherProducts = async (): Promise<VoucherProduct[]> => {
  const { data } = await api.get<VoucherProduct[]>('/vouchers/products');
  return data;
};

export const getVoucherProduct = async (id: string): Promise<VoucherProduct> => {
  const { data } = await api.get<VoucherProduct>(`/vouchers/products/${id}`);
  return data;
};

export const addVoucherProduct = async (
  newProduct: CreateVoucherProductDto
): Promise<VoucherProduct> => {
  const { data } = await api.post<VoucherProduct>(
    '/vouchers/products',
    newProduct
  );
  return data;
};

export const editVoucherProduct = async (
  id: string,
  updatedProduct: UpdateVoucherProductDto
): Promise<VoucherProduct> => {
  const { data } = await api.put<VoucherProduct>(
    `/vouchers/products/${id}`,
    updatedProduct
  );
  return data;
};

export const deleteVoucherProduct = async (id: string): Promise<void> => {
  await api.delete(`/vouchers/products/${id}`);
};

export const getMyVouchers = async (): Promise<Voucher[]> => {
  const { data } = await api.get<Voucher[]>('/vouchers/my-vouchers');
  return data;
};

export const getMyVoucherById = async (id: string): Promise<Voucher> => {
  const { data } = await api.get<Voucher>(`/vouchers/my-vouchers/${id}`);
  return data;
};

export const initiateVoucherReload = async (
  code: string,
  reloadDto: InitiateReloadDto
): Promise<any> => {
  const { data } = await api.post(
    `/vouchers/${code}/initiate-reload`,
    reloadDto
  );
  return data;
};

export const verifyVoucherReload = async (
  code: string,
  verifyDto: VerifyReloadDto
): Promise<any> => {
  const { data } = await api.post(`/vouchers/${code}/verify-reload`, verifyDto);
  return data;
};

export const initiateVoucherPurchase = async (
  purchaseDto: InitiateVoucherPurchaseDto
): Promise<any> => {
  const { data } = await api.post(
    '/vouchers/initiate-purchase',
    purchaseDto
  );
  return data;
};

export const verifyVoucherPurchase = async (
  verifyDto: VerifyVoucherPurchaseDto
): Promise<any> => {
  const { data } = await api.post('/vouchers/verify-purchase', verifyDto);
  return data;
};

export const getBusinessVoucherProducts = async (
  businessId: string
): Promise<VoucherProduct[]> => {
  const { data } = await api.get<VoucherProduct[]>(
    `/vouchers/products/business/${businessId}`
  );
  return data;
};

export const redeemVoucherManual = async (
  redeemDto: RedeemVoucherDto
): Promise<Voucher> => {
  const { data } = await api.post<Voucher>('/vouchers/redeem-manual', redeemDto);
  return data;
};

export const getSoldVouchers = async (): Promise<Voucher[]> => {
  const { data } = await api.get<Voucher[]>('/vouchers/sold');
  return data;
};