import { useEffect } from 'react';
import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { axiosInstance } from '../lib/axios';
import { clearLocalStorageAuthData } from '../utils/utils';
import { toSnakeCase, toCamelCase } from '../utils/caseConverter';

export const useAxiosInterceptor = () => {
  const onRequest = (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // API Gateway가 없는 로컬 개발 환경에서 user 헤더 직접 주입
    const userStr = localStorage.getItem('user');
    if (userStr && !config.headers['user_id']) {
      try {
        const user = JSON.parse(userStr);
        if (user.userId) config.headers['user_id'] = user.userId;
        if (user.username) config.headers['username'] = encodeURIComponent(user.username);
        if (user.email) config.headers['email'] = user.email;
        if (user.company) config.headers['company'] = user.company;
        if (user.department) config.headers['department'] = user.department;
        if (user.role) config.headers['role'] = encodeURIComponent(JSON.stringify(user.role));
      } catch {
        // user 파싱 실패 시 무시
      }
    }

    // params와 data를 snake_case로 자동 변환 (백엔드 요청용)
    if (config.params) {
      config.params = toSnakeCase(config.params);
    }
    // 단, data가 FormData인 경우는 변환 제외
    if (config.data && !(config.data instanceof FormData)) {
      config.data = toSnakeCase(config.data);
    }
    return config;
  };

  const onResponse = (response: AxiosResponse) => {
    // 응답 data를 camelCase로 자동 변환 (프론트엔드용)
    if (response.data) {
      response.data = toCamelCase(response.data);
    }
    return response;
  };

  const onError = (error: AxiosError | Error) => {
    if (axios.isAxiosError(error)) {
      const { method, url } = error.config as InternalAxiosRequestConfig;
      if (error.response) {
        const { status } = error.response;
        console.error(`[ERR] ${method?.toUpperCase()} ${url} | Error ${status} `);

        switch (status) {
          case 401: // unauthorized
            clearLocalStorageAuthData();
            window.location.href = '/login';
            break;
          case 400: // bad request
          case 403: // # 403 Forbidden
          case 404: // # 404 Not Found
            break;

          case 409: // # 409 Conflict
          case 429: // # 429 Too Many Requests
          case 500: // internal server error
            break;
          default:
            break;
        }
      }
    } else if (error instanceof Error && error.name === 'TimeoutError') {
    } else {
    }
    return Promise.reject(error);
  };

  const requestInterceptor = axiosInstance.interceptors.request.use(onRequest, onError);
  const responseInterceptor = axiosInstance.interceptors.response.use(onResponse, onError);

  useEffect(
    () => () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    },
    [requestInterceptor, responseInterceptor]
  );
};
