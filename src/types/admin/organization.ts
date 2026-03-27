export type OrganizationStatus = '활성' | '비활성';

export interface Organization {
  id: number | string;
  name: string;
  description: string;
  status: OrganizationStatus;
  createdAt: string;
}

export interface CreateOrganizationForm {
  name: string;
  description: string;
  isActive: boolean;
}

export interface EditOrganizationForm extends CreateOrganizationForm {
  id: number | string;
}

// ----- API 응답용 -----
export interface IOrganizationResponse {
  id: number | null;
  name: string | null;
  description: string | null;
  isActive: boolean | null;
  updateDt: string | null;
  createDt: string | null;
  members?: unknown[];
}

export interface IOrganizationListResponse {
  organizationList: IOrganizationResponse[];
  totalCount: number;
  nextOffset: number;
}
