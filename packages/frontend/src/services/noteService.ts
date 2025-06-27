import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { AxiosError } from "axios";

const API_URL = "";

interface JwtPayload {
  username: string;
  exp: number;
  iat?: number;
}

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
};

const handleAuthError = (error: unknown) => {
  const err = error as AxiosError;
  if (err.response && err.response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.reload();
  } else {
    throw error;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getNotes = async () => {
  try {
    const response = await axios.get(`${API_URL}/notes`, getAuthHeader());
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const getNote = async (title: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/notes/${encodeURIComponent(title)}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const addNote = async (note: {
  title: string;
  body: string;
  color: string;
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/notes`,
      note,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const deleteNote = async (title: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/notes/${encodeURIComponent(title)}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const updateNote = async (
  title: string,
  updatedFields: { title?: string; body?: string }
) => {
  try {
    const response = await axios.patch(
      `${API_URL}/notes/${encodeURIComponent(title)}`,
      updatedFields,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};
