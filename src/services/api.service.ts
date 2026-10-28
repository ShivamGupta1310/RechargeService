import { API_BASE_URL } from '../constants/api';

type ApiHeaders = Record<string, string>;
type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: ApiHeaders;
};

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  constructor(private readonly baseUrl = API_BASE_URL) {}

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { body, headers, ...requestOptions } = options;
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => undefined);

    if (!response.ok) {
      const message = payload && typeof payload === 'object' && 'error' in payload
        ? String(payload.error)
        : `Request failed with status ${response.status}`;
      throw new ApiError(response.status, message);
    }

    return payload as T;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body: unknown, headers?: ApiHeaders) {
    return this.request<T>(path, { method: 'POST', body, headers });
  }
}

export const apiService = new ApiService();
