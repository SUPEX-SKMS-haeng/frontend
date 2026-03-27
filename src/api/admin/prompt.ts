import {
  type IGetPromptListParams,
  type ICreatePromptRequest,
  type IUpdatePromptRequest,
  type IUpdateIsActiveRequest,
  type IPromptListResponse,
} from '@/types/admin/prompt';
import { axiosInstance } from '@/lib/axios';

const URL_PREFIX = '/llm-gateway/prompts';

// 프롬프트 타입 목록 조회
export const getPromptTypes = async () => {
  const { data } = await axiosInstance.get<{ types: string[] }>(
    `${URL_PREFIX}/types`
  );
  const list = data?.types;
  return Array.isArray(list) ? list : [];
};

// 조직별 프롬프트 목록 조회
export const getPromptListByOrg = async (params: IGetPromptListParams) => {
  await new Promise((r) => setTimeout(r, 300));
  let prompts = await axiosInstance.get<IPromptListResponse>(
    `${URL_PREFIX}/assignments`,
    { params }
  );

  return prompts.data;
};

// 프롬프트 생성
export const createPrompt = async (body: ICreatePromptRequest) => {
  const { data } = await axiosInstance.post(`${URL_PREFIX}`, body);
  return data;
};

// 프롬프트 수정
export const updatePrompt = async (
  promptId: number,
  body: IUpdatePromptRequest
) => {
  const { data } = await axiosInstance.patch(`${URL_PREFIX}/${promptId}`, body);
  return data;
};

// 프롬프트 활성 상태 변경
export const updateIsActive = async (
  promptId: number,
  body: IUpdateIsActiveRequest
) => {
  const { data } = await axiosInstance.patch(
    `${URL_PREFIX}/${promptId}/activation`,
    body
  );
  return data;
};

// 프롬프트 삭제
export const deletePrompt = async (
  promptId: number | string,
  orgId: string | number | undefined
) => {
  const { data } = await axiosInstance.delete(`${URL_PREFIX}/${promptId}`, {
    params: { orgId },
  });
  return data;
};
