import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { SalesChartData, SalesChartQuery, StorefrontReportData } from "./types";

export const useGetSalesChart = (query: SalesChartQuery) => {
  return useQuery<SalesChartData[]>({
    queryKey: ["salesChart", query],
    queryFn: async () => {
      const { data } = await api.get("/stats/sales-chart", {
        params: query,
      });
      return data;
    },
  });
};

export const useGetStorefrontReport = (period: 'weekly' | 'monthly') => {
  return useQuery<StorefrontReportData>({
    queryKey: ["storefrontReport", period],
    queryFn: async () => {
      const { data } = await api.get("/stats/reports", {
        params: { period },
      });
      return data;
    },
  });
};
