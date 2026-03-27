import { useEffect } from 'react';
import { clearLocalStorageAuthData } from '@/utils/utils';

export const useFetchInterceptor = () => {
  useEffect(() => {
    const { fetch: originalFetch } = window;
    const BASE_URL = '/api/v1';

    window.fetch = async (...args) => {
      const [resource, config] = args;
      const headers: any = config?.headers || {};
      let response: Response;

      const url =
        typeof resource === 'string' &&
        !resource.startsWith('http') &&
        !resource.startsWith('/api')
          ? `${BASE_URL}${resource.startsWith('/') ? resource : `/${resource}`}`
          : resource;

      const accessToken = localStorage.getItem('accessToken');
      if (accessToken && !headers.Authorization) {
        headers.Authorization = `Bearer ${accessToken}`;
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
