import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import {
  InitiatePaymentDto,
  InitiatePaymentResponse,
  Membership,
  VerifyPaymentDto,
} from "./types";

export const useInitiatePayment = () => {
  return useMutation<InitiatePaymentResponse, Error, InitiatePaymentDto>({
    mutationFn: (data) => api.post("/membership/initiate-payment", data),
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, VerifyPaymentDto>({
    mutationFn: (data) => api.post("/membership/verify-payment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-membership"] });
    },
  });
};

export const useGetMyMembership = () => {
  return useQuery<Membership, Error>({
    queryKey: ["my-membership"],
    queryFn: () => api.get("/membership/my"),
  });
};