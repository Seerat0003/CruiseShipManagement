export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'user';

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    clearAuthSession();
    return null;
  }
};

export const hasAuthSession = () => Boolean(getStoredToken() && getStoredUser());

export const setAuthSession = (token, user) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const getDefaultRouteForRole = (role) => {
  if (role === 'admin') {
    return '/admin/dashboard';
  }

  if (role === 'manager') {
    return '/manager/viewparty';
  }

  return '/voyager/dashboard';
};
