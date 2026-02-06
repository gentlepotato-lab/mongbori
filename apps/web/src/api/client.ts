export type User = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

export type Run = {
  id: number;
  difficulty: string;
  score: number;
  height: number;
  durationMs: number;
  obstaclesAvoided: number;
  createdAt: string;
};

export type LeaderboardEntry = Run & {
  displayName: string;
};

const envBase = (import.meta.env.VITE_API_BASE ?? '').trim();
const normalizedBase = envBase.endsWith('/') ? envBase.slice(0, -1) : envBase;

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api')) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }
  return `${normalizedBase}${normalizedPath}`;
};

const buildFallbackUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return normalizedPath;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:4080${normalizedPath}`;
};

let authToken = localStorage.getItem('mongbori_token') ?? '';

export const setToken = (token: string) => {
  authToken = token;
  if (token) {
    localStorage.setItem('mongbori_token', token);
  } else {
    localStorage.removeItem('mongbori_token');
  }
};

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? 'request_failed');
  }
  return payload;
};

export const api = {
  login: async (email: string, password: string) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }) as Promise<{ token: string; user: User }>;
  },
  register: async (displayName: string, email: string, password: string) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ displayName, email, password })
    }) as Promise<{ token: string; user: User }>;
  },
  me: async () => {
    return request('/api/auth/me') as Promise<{ user: User }>;
  },
  saveRun: async (run: {
    difficulty: string;
    score: number;
    height: number;
    durationMs: number;
    obstaclesAvoided: number;
  }) => {
    return request('/api/runs', {
      method: 'POST',
      body: JSON.stringify(run)
    }) as Promise<{ run: Run }>;
  },
  leaderboard: async (difficulty: string, limit = 10) => {
    const diff = difficulty ? encodeURIComponent(difficulty) : 'all';
    try {
      return await request(`/api/leaderboard?difficulty=${diff}&limit=${limit}`) as Promise<{
        leaderboard: LeaderboardEntry[];
      }>;
    } catch (_error) {
      const response = await fetch(buildFallbackUrl(`/api/leaderboard?difficulty=${diff}&limit=${limit}`), {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? 'request_failed');
      }
      return payload as { leaderboard: LeaderboardEntry[] };
    }
  }
};
