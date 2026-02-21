import useSWRMutation from "swr/mutation";
import api from "../api";
import { InitiatePurchaseDto, VerifyPurchaseDto } from "../gift-card/types";

// Step 1: Initiate Purchase
async function initiateGiftCardPurchase(url: string, { arg }: { arg: InitiatePurchaseDto }) {
  return api.post(url, arg);
}

export function useInitiateGiftCardPurchase() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/gift-cards/purchase",
    initiateGiftCardPurchase
  );

  return {
    initiatePurchase: trigger,
    isInitiating: isMutating,
    error,
  };
}

// Step 2: Verify Purchase
async function verifyGiftCardPurchase(url: string, { arg }: { arg: VerifyPurchaseDto }) {
  return api.post(url, arg);
}

export function useVerifyGiftCardPurchase() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/gift-cards/purchase/verify",
    verifyGiftCardPurchase
  );

  return {
    verifyPurchase: trigger,
    isVerifying: isMutating,
    error,
  };
}
