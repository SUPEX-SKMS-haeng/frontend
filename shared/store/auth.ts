import { atom } from 'jotai';
import type { User, Group } from '../types/auth';

export const userAtom = atom<User | null>(null);

export const isAuthenticatedAtom = atom<boolean>(
  !!localStorage.getItem('accessToken')
);

export const selectedGroupAtom = atom<Group>({
  orgId: -1,
  orgName: '',
  orgDescription: '',
  role: 'common',
} as Group);
export const userGroupsAtom = atom<Group[]>([]);
