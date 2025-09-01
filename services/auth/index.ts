// services/authService.ts
import { mainApi } from "../apis";
import { setToken } from "../tokenService";

export interface EmailAuthPayload {
  email: string;
  password: string;
}

export const emailAuth = async (payload: EmailAuthPayload, mode: 'login' | 'register') => {
  const endpoint = mode === 'login' ? '/users/login/' : '/users/register/';
  try {
    const { data } = await mainApi.post(endpoint, payload);

    // Guardar token solo si viene del backend
    if (data?.token) {
      await setToken(data.token);
    }

    return data;
  } catch (err: any) {
    if (err.response?.data?.error) {
      // devolver el mensaje de error que envía Django
      throw new Error(err.response.data.error);

    } else {
      throw new Error(err.message || "Something went wrong");
    }
  }
};


export const googleAuth = async (idToken: string) => {
  try {
    const { data } = await mainApi.post('/users/google/', { token: idToken });

    if (data?.token) {
      await setToken(data.token);
    }

    return data;
  } catch (error: any) {
    console.log(error);
    if (error.response) throw new Error(error.response.data?.error || 'Something went wrong');
    throw new Error(error.message || 'Could not connect to server');
  }
};