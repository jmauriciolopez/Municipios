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
