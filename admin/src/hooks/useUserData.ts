import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  deleteBulkUsers,
} from '@/api/user';
import { queryClient } from '@shared/lib/queryClient';
import type {
  User,
  CreateUserForm,
  EditUserForm,
  IUserItemResponse,
} from '@/types/user';
import { atomWithMutation, atomWithQuery } from 'jotai-tanstack-query';
import { userListParamsAtom } from '@/store/userUI';
import dayjs from 'dayjs';

const USER_DATA_KEY = ['user'];

const mapToUserItem = (res: IUserItemResponse): Omit<User, 'lastAccessAt'> => ({
  loginId: res.userId,
  name: res.username,
  company: res.company,
  role: capitalizeRole(res.role?.default || 'common'),
  status: res.isActive ? '활성' : '비활성',
});

// 사용자 목록 조회
export const getUserListAtom = atomWithQuery((get) => {
  const params = get(userListParamsAtom);
  return {
    queryKey: [...USER_DATA_KEY, 'list', params],
    queryFn: async (): Promise<{
      users: User[];
      total: number;
      nextOffset: number;
    }> => {
      const { searchCategory, searchKeyword, isActive, ...restParams } = params;
      const res = await getUserList({
        ...restParams,
        searchCategory: searchCategory || undefined,
        searchKeyword: searchKeyword || undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      });
      const mapped: User[] = res.userList.map(
        (item: IUserItemResponse): User => ({
          ...mapToUserItem(item),
          lastAccessAt: item.lastSignIn
            ? dayjs(item.lastSignIn).format('YYYY-MM-DD HH:mm:ss')
            : '-',
        })
      );

      return {
        users: mapped,
        total: res.totalCount,
        nextOffset: res.nextOffset,
      };
    },
    staleTime: 0,
  };
});

// 사용자 생성
export const createUserAtom = atomWithMutation(() => ({
  mutationKey: [...USER_DATA_KEY, 'create'],
  mutationFn: async (formData: CreateUserForm): Promise<User> => {
    const res = await createUser({
      userId: formData.loginId,
      username: formData.name,
      company: formData.company,
      role: formData.role.toLowerCase(),
      isActive: formData.isActive,
      email: null, // 백엔드 EmailStr 검증: 빈 문자열 불가, null만 허용
      department: null,
      password: `${formData.loginId}!@`, // userID!@
    });
    return {
      ...mapToUserItem(res),
      lastAccessAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 데이터 추가(생성) 시각
    };
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...USER_DATA_KEY, 'list'],
    });
  },
  onError: (error) => {
    console.error('사용자 생성 실패:', error);
    alert('사용자 생성에 실패했습니다.');
  },
}));

// 사용자 수정
export const updateUserAtom = atomWithMutation(() => ({
  mutationKey: [...USER_DATA_KEY, 'update'],
  mutationFn: async (formData: EditUserForm): Promise<User> => {
    const res = await updateUser({
      userId: formData.loginId,
      username: formData.name,
      company: formData.company,
      role: formData.role.toLowerCase(),
      isActive: formData.isActive,
    });
    return {
      ...mapToUserItem(res),
      lastAccessAt: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 데이터 수정 시각
    };
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...USER_DATA_KEY, 'list'],
    });
  },
  onError: (error) => {
    console.error('사용자 수정 실패:', error);
    alert('사용자 수정에 실패했습니다.');
  },
}));

// 단일 삭제
export const deleteUserAtom = atomWithMutation(() => ({
  mutationKey: [...USER_DATA_KEY, 'delete'],
  mutationFn: async (userId: string): Promise<boolean> => {
    return await deleteUser(userId);
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...USER_DATA_KEY, 'list'],
    });
  },
  onError: (error) => {
    console.error('사용자 삭제 실패:', error);
    alert('사용자 삭제에 실패했습니다.');
  },
}));

// 다중 삭제
export const deleteBulkUsersAtom = atomWithMutation(() => ({
  mutationKey: [...USER_DATA_KEY, 'deleteBulk'],
  mutationFn: async (userIds: string[]): Promise<boolean> => {
    const res = await deleteBulkUsers(userIds);
    return res?.success === true;
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({
      queryKey: [...USER_DATA_KEY, 'list'],
    });
  },
  onError: (error) => {
    console.error('사용자 다중 삭제 실패:', error);
    alert('사용자 삭제에 실패했습니다.');
  },
}));

// 유틸리티 함수
function capitalizeRole(role: string): 'SuperAdmin' | 'Admin' | 'Common' {
  if (role === 'superadmin') return 'SuperAdmin';
  if (role === 'admin') return 'Admin';
  return 'Common';
}
