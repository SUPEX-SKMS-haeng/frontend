import type { User } from '@/types/user';

export type MemberRole = 'Admin' | 'Common';

export interface Member extends Pick<
  User,
  'loginId' | 'name' | 'company' | 'status'
> {
  id?: number; // 멤버십 레코드 PK (organization_member.id). 역할 수정 PATCH, 멤버 삭제 등에 사용
  userId?: number; // 실제 사용자 PK (user.id). 멤버 추가/삭제 API 통신 시 사용
  role?: MemberRole; // 조직 내 역할 (organization_member.role). 시스템 역할과 별개
}

export interface MemberCandidate {
  loginId: string; // user_login_id
  userId: number; // user.id (numeric)
  name: string;
  company: string;
}

// ----- API 응답용 -----
export interface IMemberResponse {
  id: number | null; // organization_member.id
  orgId: number | null;
  userId: number | null; // user.id (numeric)
  role: string | null; // 'admin' | 'common'
  updateDt: string | null;
  createDt: string | null;
  userLoginId?: string | null; // user.user_id
  username?: string | null;
  company?: string | null;
  isActive?: boolean | null;
  lastSignIn?: string | null;
}

export interface IMemberListResponse {
  memberList: IMemberResponse[];
  totalCount: number;
  nextOffset: number;
}
