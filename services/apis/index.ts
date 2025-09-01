import axios, { AxiosRequestConfig, AxiosInstance } from "axios";

const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    skipAuthInterceptor?: boolean;
}

// Crea una instancia tipada
export const mainApi: AxiosInstance = axios.create({
    baseURL: BASE_API_URL,
});
