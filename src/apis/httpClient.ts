import type { AxiosResponse, AxiosRequestConfig, } from "axios";
import axios from "axios";

async function http<T>( //la <T> significa aqui "No sé qué tipo de datos voy a recibir, pero tú me lo vas a decir cuando llames la función."
  path: string, //aqui va el tipo de url como "/tasks" por ejemplo
  config: AxiosRequestConfig //Es la configuración del request method: "get", headers: {...}
): Promise<AxiosResponse<T>> { //Devuelve una promesa que contiene la respuesta de axios tipada
  try {
    const response = await axios.request<T>({ url: path, ...config }); //Usa axios luego le pasa URL luego pasa el metodo (get, post, etc), le pasa el body si existe y luego espera la respuesta
    return response; 
  } catch (error) {
    if (axios.isAxiosError(error)) { //Manejo de errores
      console.error('Axios error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error; 
  }
}
export async function get<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const requestConfig: AxiosRequestConfig = { method: "get", ...config };
  const response = await http<T>(path, requestConfig);
  return response;
}

export async function post<T, U>(
  path: string,
  data: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const requestConfig: AxiosRequestConfig = { method: "post", data, ...config };
  const response = await http<T>(path, requestConfig);
  return response;
}

export async function put<T, U>(
  path: string,
  data: U,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const requestConfig: AxiosRequestConfig = { method: "put", data, ...config };
  const response = await http<T>(path, requestConfig);
  return response;
}

export async function del<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  const requestConfig: AxiosRequestConfig = { method: "delete", ...config };
  const response = await http<T>(path, requestConfig);
  return response;
}