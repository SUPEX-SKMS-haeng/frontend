export interface LoginRequest {
  id: string;
  password: string;
}

export interface UserRoleOrganization {
  orgId: number;
  orgName: string;
  orgDescription: string | null;
  role: string;
}

export interface UserRole {
  default: string;
  organizations: UserRoleOrganization[];
}

export interface LoginResponse {
  accessToken: string;
  user: {
    userId: string;
    email: string;
    username: string;
    company: string;
    department: string;
    role: UserRole;
  };
}

export interface User {
  userId: string;
  email: string;
  username: string;
  company: string;
  department: string;
  role: UserRole;
}

export interface Group {
  orgId: number;
  orgName: string;
  orgDescription: string;
  role: string;
}

export interface GroupListResponse {
  organizationList: Group[];
  totalCount: number;
}
