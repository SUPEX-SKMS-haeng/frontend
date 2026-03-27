import { axiosInstance } from '../lib/axios';
import type { GroupListResponse } from '../types/auth';

export const getUserGroups = async (
  userId: string
): Promise<GroupListResponse> => {
  const response = await axiosInstance.get<GroupListResponse>(
    `/organization/members/user/${userId}`
  );
  return response.data;
};
