import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api from '../../services/api.js';

const getRequestHandler = () => api.interceptors.request.handlers.find(Boolean);
const getResponseHandler = () => api.interceptors.response.handlers.find(Boolean);

describe('api — interceptor de request', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adiciona header Authorization quando há token no localStorage', () => {
    localStorage.setItem('token', 'meu-jwt');
    const config = { headers: {} };

    const result = getRequestHandler().fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer meu-jwt');
  });

  it('não adiciona header Authorization quando não há token', () => {
    const config = { headers: {} };

    const result = getRequestHandler().fulfilled(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('retorna o config original sem modificá-lo além do token', () => {
    localStorage.setItem('token', 'tok');
    const config = { headers: {}, url: '/api/test' };

    const result = getRequestHandler().fulfilled(config);

    expect(result.url).toBe('/api/test');
  });
});

describe('api — interceptor de response', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('repassa respostas bem-sucedidas sem alteração', async () => {
    const response = { status: 200, data: { ok: true } };

    const result = await getResponseHandler().fulfilled(response);

    expect(result).toBe(response);
  });

  it('limpa localStorage ao receber erro 401', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('usuario', '{"nome":"Ana"}');
    vi.stubGlobal('location', { href: '' });

    try {
      await getResponseHandler().rejected({ response: { status: 401 } });
    } catch {}

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('redireciona para /login ao receber erro 401', async () => {
    const mockLocation = { href: '' };
    vi.stubGlobal('location', mockLocation);

    try {
      await getResponseHandler().rejected({ response: { status: 401 } });
    } catch {}

    expect(mockLocation.href).toBe('/login');
  });

  it('propaga erros que não são 401', async () => {
    const error = { response: { status: 500 } };

    await expect(getResponseHandler().rejected(error)).rejects.toEqual(error);
  });

  it('propaga erros sem response (ex: network error)', async () => {
    const error = new Error('Network Error');

    await expect(getResponseHandler().rejected(error)).rejects.toEqual(error);
  });
});
