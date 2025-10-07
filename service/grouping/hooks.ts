import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { CreateGroupDto, Group, GroupMember } from "./types";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, CreateGroupDto>({
    mutationFn: (data) => api.post("/grouping", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
  });
};

export const useJoinGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<GroupMember, Error, { groupId: string }>({
    mutationFn: ({ groupId }) => api.post(`/grouping/${groupId}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
    },
  });
};

export const useGetMyGroups = () => {
  return useQuery<Group[], Error>({
    queryKey: ["my-groups"],
    queryFn: () => api.get("/grouping/my"),
  });
};