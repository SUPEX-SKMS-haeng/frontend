import { useEffect } from 'react';
import { clearLocalStorageAuthData } from '../utils/utils';
import { toSnakeCase } from '../utils/caseConverter';

export const useFetchInterceptor = () => {
  useEffect(() => {
    const { fetch: originalFetch } = window;
    const BASE_URL = '/api/v1';

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const headers: any = config?.headers || {};
      let response: Response;

      const url =
        typeof resource === 'string' && !resource.startsWith('http') && !resource.startsWith('/api')
          ? `${BASE_URL}${resource.startsWith('/') ? resource : `/${resource}`}`
          : resource;

      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      // API Gateway가 없는 로컬 개발 환경에서 user 헤더 직접 주입
      const userStr = localStorage.getItem('user');
      if (userStr && !headers['user_id']) {
        try {
          const user = JSON.parse(userStr);
          if (user.userId) headers['user_id'] = user.userId;
          if (user.username) headers['username'] = encodeURIComponent(user.username);
          if (user.email) headers['email'] = user.email;
          if (user.company) headers['company'] = user.company;
          if (user.department) headers['department'] = user.department;
          if (user.role)
            headers['role'] = encodeURIComponent(JSON.stringify(toSnakeCase(user.role)));
        } catch {
          // user 파싱 실패 시 무시
        }
      }

      try {
        response = await originalFetch(url, {
          ...config,
          headers,
        });
        if (response.status === 401) {
          clearLocalStorageAuthData();
          window.location.href = '/login';
        }
        return response;
      } catch (error) {
        console.error('fetch error', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
};
