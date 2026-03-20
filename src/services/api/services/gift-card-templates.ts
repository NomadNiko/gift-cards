import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { GiftCardTemplate, QrPosition } from "../types/gift-card-template";
import { InfinityPaginationType } from "../types/infinity-pagination";
import { RequestConfigType } from "./types/request-config";
import { CodePosition } from "../types/code-position";

// --- Create ---
export type CreateGiftCardTemplateRequest = {
  name: string;
  description?: string;
  image: string;
  codePosition: CodePosition;
  redemptionType?: "partial" | "full";
  expirationDate?: string | null;
  expirationMonths?: number | null;
  codePrefix?: string;
  qrPosition?: QrPosition;
  isActive?: boolean;
};

export function useCreateGiftCardTemplateService() {
  const fetch = useFetch();
  return useCallback(
    (data: CreateGiftCardTemplateRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-card-templates`, {
        method: "POST",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCardTemplate>),
    [fetch]
  );
}

// --- List ---
export type GetGiftCardTemplatesRequest = {
  page: number;
  limit: number;
};

export function useGetGiftCardTemplatesService() {
  const fetch = useFetch();
  return useCallback(
    (data: GetGiftCardTemplatesRequest, requestConfig?: RequestConfigType) => {
      const url = new URL(`${API_URL}/v1/gift-card-templates`);
      url.searchParams.append("page", data.page.toString());
      url.searchParams.append("limit", data.limit.toString());
      return fetch(url, { method: "GET", ...requestConfig }).then(
        wrapperFetchJsonResponse<InfinityPaginationType<GiftCardTemplate>>
      );
    },
    [fetch]
  );
}

// --- Get Active (Public) ---
export function useGetActiveGiftCardTemplatesService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-card-templates/active`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCardTemplate[]>),
    [fetch]
  );
}

// --- Get One (Public) ---
export function useGetGiftCardTemplatePublicService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-card-templates/public/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCardTemplate>),
    [fetch]
  );
}

// --- Get One ---
export function useGetGiftCardTemplateService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-card-templates/${id}`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCardTemplate>),
    [fetch]
  );
}

// --- Update ---
export type UpdateGiftCardTemplateRequest =
  Partial<CreateGiftCardTemplateRequest>;

export function useUpdateGiftCardTemplateService() {
  const fetch = useFetch();
  return useCallback(
    (
      id: string,
      data: UpdateGiftCardTemplateRequest,
      requestConfig?: RequestConfigType
    ) =>
      fetch(`${API_URL}/v1/gift-card-templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<GiftCardTemplate>),
    [fetch]
  );
}

// --- Delete ---
export function useDeleteGiftCardTemplateService() {
  const fetch = useFetch();
  return useCallback(
    (id: string, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/gift-card-templates/${id}`, {
        method: "DELETE",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<void>),
    [fetch]
  );
}
