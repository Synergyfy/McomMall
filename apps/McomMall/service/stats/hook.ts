import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { SalesChartData, SalesChartQuery } from "./types";

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
