import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { GiftCard } from "../types/gift-card";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { RequestConfigType } from "./types/request-config";

// --- Purchase (Public) ---
export type PurchaseGiftCardRequest = {
  templateId: string;
  widgetId?: string;
  originalAmount: number;
  purchaserEmail: string;
  purchaserName: string;
  recipientEmail?: string;
  recipientName?: string;
  notes?: string;
};

export function usePurchaseGiftCardService() {
  const fetch = useFetch();
  return useCallback(
    (data: PurchaseGiftCardRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Create Checkout Session (Public, Stripe) ---
export type CreateCheckoutSessionRequest = PurchaseGiftCardRequest & {
  successUrl: string;
  cancelUrl: string;
};

export function useCreateCheckoutSessionService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateCheckoutSessionRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/create-checkout-session`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<{ sessionId: string; url: string }>),
    [fetch]
  );
}

// --- List (Admin) ---
export type GetGiftCardsRequest = {
  page: number;
  limit: number;
  status?: string;
  templateId?: string;
};

export function useGetGiftCardsService() {
  const fetch = useFetch();
  return useCallback(
    (data: GetGiftCardsRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/gift-cards`);
      url.searchParams.append("page", data.page.toString());
      url.searchParams.append("limit", data.limit.toString());
      if (data.status) url.searchParams.append("status", data.status);
      if (data.templateId)
        url.searchParams.append("templateId", data.templateId);
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<InfinityPaginationType<GiftCard>>
      );
    },
    [fetch]
  );
}

// --- Get One (Admin) ---
export function useGetGiftCardService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Lookup by Code (Public) ---
export function useGetGiftCardByCodeService() {
  const fetch = useFetch();
  return useCallback(
    (code: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/code/${code}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Lookup by Email (Public) ---
export function useGetGiftCardsByEmailService() {
  const fetch = useFetch();
  return useCallback(
    (email: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/email/${email}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard[]>),
    [fetch]
  );
}

// --- Lookup by Stripe Session (Public) ---
export function useGetGiftCardByStripeSessionService() {
  const fetch = useFetch();
  return useCallback(
    (sessionId: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/stripe-session/${sessionId}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Redeem (Admin) ---
export type RedeemGiftCardRequest = {
  amount?: number;
  notes?: string;
};

export function useRedeemGiftCardService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: string,
      data: RedeemGiftCardRequest,
      requestConfig?: RequestConfigType
    ) =>
      fetch(`${API_URL}/v1/gift-cards/${id}/redeem`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Cancel (Admin) ---
export function useCancelGiftCardService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-cards/${id}/cancel`, {
        method: "PATCH",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}

// --- Unredeem (Admin) ---
export function useUnredeemGiftCardService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: string,
      data: { redemptionId: string },
      requestConfig?: RequestConfigType
    ) =>
      fetch(`${API_URL}/v1/gift-cards/${id}/unredeem`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCard>),
    [fetch]
  );
}
