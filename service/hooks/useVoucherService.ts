import useSWR, { useSWRConfig } from 'swr';
import {
  Voucher,
  VoucherProduct,
  CreateVoucherProductDto,
  UpdateVoucherProductDto,
  PurchaseVoucherDto,
  RedeemVoucherDto,
} from '../vouchers/types';
import api from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const fetcher = (url: string) => api.get(url).then(res => res.data);

// Business Owner Hooks
export const useGetVoucherProducts = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const {
    data: voucherProducts,
    error,
    mutate,
  } = useSWR<VoucherProduct[]>(
    token ? '/business/vouchers/products' : null,
    fetcher
  );

  return {
    voucherProducts,
    isLoading: !error && !voucherProducts,
    isError: error,
    mutate,
  };
};

export const useAddVoucherProduct = () => {
  const { mutate } = useSWRConfig();
  const addVoucherProduct = async (productData: CreateVoucherProductDto) => {
    const response = await api.post('/business/vouchers/products', productData);
    mutate('/business/vouchers/products');
    return response.data;
  };
  return addVoucherProduct;
};

export const useEditVoucherProduct = () => {
  const { mutate } = useSWRConfig();
  const editVoucherProduct = async (id: string, productData: UpdateVoucherProductDto) => {
    const response = await api.patch(`/business/vouchers/products/${id}`, productData);
    mutate('/business/vouchers/products');
    return response.data;
  };
  return editVoucherProduct;
};

export const useDeleteVoucherProduct = () => {
  const { mutate } = useSWRConfig();
  const deleteVoucherProduct = async (id: string) => {
    await api.delete(`/business/vouchers/products/${id}`);
    mutate('/business/vouchers/products');
  };
  return deleteVoucherProduct;
};

export const useGetSoldVouchers = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data: soldVouchers, error } = useSWR<Voucher[]>(
    token ? '/business/vouchers/sold' : null,
    fetcher
  );

  return {
    soldVouchers,
    isLoading: !error && !soldVouchers,
    isError: error,
  };
};

export const useRedeemVoucherManual = () => {
  const { mutate } = useSWRConfig();
  const redeemVoucher = async (redeemData: RedeemVoucherDto) => {
    const response = await api.post('/business/vouchers/redeem/manual', redeemData);
    mutate('/business/vouchers/sold');
    return response.data;
  };
  return redeemVoucher;
};


// Consumer Hooks

export const useGetBusinessVoucherProducts = (businessId: string) => {
  const { data: voucherProducts, error } = useSWR<VoucherProduct[]>(
    businessId ? `/vouchers/products/business/${businessId}` : null,
    fetcher
  );

  return {
    voucherProducts,
    isLoading: !error && !voucherProducts,
    isError: error,
  };
};

export const useGetMyVouchers = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const { data: myVouchers, error } = useSWR<Voucher[]>(
    token ? '/vouchers/my-vouchers' : null,
    fetcher
  );

  return {
    myVouchers,
    isLoading: !error && !myVouchers,
    isError: error,
  };
};

export const usePurchaseVoucher = () => {
  const { mutate } = useSWRConfig();
  const purchaseVoucher = async (purchaseData: PurchaseVoucherDto) => {
    const response = await api.post('/vouchers/purchase', purchaseData);
    mutate('/vouchers/my-vouchers');
    return response.data;
  };
  return purchaseVoucher;
};

export const useRedeemVoucher = () => {
  const redeemVoucher = async (redeemData: RedeemVoucherDto) => {
    const response = await api.post('/vouchers/redeem', redeemData);
    // Optionally revalidate user's vouchers
    // mutate('/vouchers/my-vouchers');
    return response.data;
  };
  return redeemVoucher;
};

export const useGetVoucherByCode = (code: string) => {
  const { data: voucher, error } = useSWR<Voucher>(
    code ? `/vouchers/${code}` : null,
    fetcher
  );

  return {
    voucher,
    isLoading: !error && !voucher,
    isError: error,
  };
};