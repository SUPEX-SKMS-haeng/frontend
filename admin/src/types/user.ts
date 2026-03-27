export type SystemRole = 'SuperAdmin' | 'Admin' | 'Common';
export type UserStatus = '활성' | '비활성';

export interface User {
  loginId: string;
  name: string;
  company: string;
  role: SystemRole;
  status: UserStatus;
  lastAccessAt: string;
}

export interface CreateUserForm {
  loginId: string;
  name: string;
  company: string;
  role: SystemRole;
  isActive: boolean;
}

export interface EditUserForm extends CreateUserForm {}

// ----- API 응답용 -----
export interface IUserOrganizationInfo {
  orgId: number;
  orgName: string;
  orgDescription: string | null;
  role: string | null;
}

export interface IUserOrganizationRole {
  default: string;
  organizations: IUserOrganizationInfo[];
}

export interface IUserItemResponse {
  id: number;
  userId: string;
  email: string | null;
  username: string;
  department: string | null;
  company: string;
  role: IUserOrganizationRole;
  isActive: boolean;
  lastSignIn: string | null;
}

export interface IUserListResponse {
  userList: IUserItemResponse[];
  nextOffset: number;
  totalCount: number;
}

export interface IUserBulkDeleteResponse {
  success: boolean;
  data?: Record<string, string>;
}
