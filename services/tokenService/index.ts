// services/tokenService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const setToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("authToken", token);
  } catch (err) {
    console.error("No se pudo guardar el token", err);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (err) {
    console.error("No se pudo obtener el token", err);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (err) {
    console.error("No se pudo borrar el token", err);
  }
};
