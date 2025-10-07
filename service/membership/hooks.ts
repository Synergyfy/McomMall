import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { CreateMembershipDto, Membership } from "./types";

export const useCreateMembership = () => {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, CreateMembershipDto>({
    mutationFn: (data) => api.post("/membership", data),
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