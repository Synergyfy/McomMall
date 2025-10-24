import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { OwnerStatsDto, CustomerStatsDto } from "./types";

export const useGetStats = <T extends OwnerStatsDto | CustomerStatsDto>() => {
  return useQuery<T>({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get("/stats");
      return data;
    },
  });
};
