import { useCallback } from "react";
import useFetch from "../use-fetch";
import { API_URL } from "../config";
import wrapperFetchJsonResponse from "../wrapper-fetch-json-response";
import { Settings } from "../types/settings";
import { RequestConfigType } from "./types/request-config";

export function useGetSettingsService() {
  const fetch = useFetch();
  return useCallback(
    (requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/settings`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Settings>),
    [fetch]
  );
}

export type UpdateSettingsRequest = {
  currency?: "GBP" | "EUR" | "USD";
  defaultRedemptionType?: "partial" | "full";
  notificationEmails?: string[];
};

export function useUpdateSettingsService() {
  const fetch = useFetch();
  return useCallback(
    (data: UpdateSettingsRequest, requestConfig?: RequestConfigType) =>
      fetch(`${API_URL}/v1/settings`, {
        method: "PATCH",
        body: JSON.stringify(data),
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<Settings>),
    [fetch]
  );
}
