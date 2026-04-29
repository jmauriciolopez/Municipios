const TOKEN_KEY = 'municipio_token';

export const saveToken = async (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

