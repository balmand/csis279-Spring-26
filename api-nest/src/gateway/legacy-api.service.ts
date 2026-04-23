import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

@Injectable()
export class LegacyApiService {
  private readonly baseUrl = (
    process.env.LEGACY_API_URL || 'http://localhost:3001'
  ).replace(/\/+$/, '');

  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { headers });
  }

  async post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, headers });
  }

  async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, headers });
  }

  async delete(path: string, headers?: Record<string, string>): Promise<void> {
    await this.request(path, { method: 'DELETE', headers });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method || 'GET',
        headers: {
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      throw new BadGatewayException('The legacy API is unavailable.');
    }

    const payload = await this.parseBody(response);

    if (!response.ok) {
      throw this.toHttpException(response.status, payload);
    }

    return payload as T;
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  private toHttpException(status: number, payload: any) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' ? payload : 'Request to legacy API failed.');

    switch (status) {
      case 400:
        return new BadRequestException(message);
      case 401:
        return new UnauthorizedException(message);
      case 403:
        return new ForbiddenException(message);
      case 404:
        return new NotFoundException(message);
      case 409:
        return new ConflictException(message);
      case 502:
      case 503:
      case 504:
        return new BadGatewayException(message);
      default:
        return new InternalServerErrorException(message);
    }
  }
}
