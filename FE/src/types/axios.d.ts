// import axios from "axios";

// declare module "axios" {
//   export interface AxiosResponse<T = any> extends Promise<T> {}
// }


// src/types/axios.d.ts (Thay thế toàn bộ file)

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Định nghĩa này sẽ ghi đè lên thư viện axios
declare module 'axios' {
  // 1. Ghi đè kiểu trả về của các hàm (get, post...)
  //    Để chúng trả về T (dữ liệu) thay vì AxiosResponse<T>
  export interface AxiosInstance {
    request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = T, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    delete<T = any, R = T, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    head<T = any, R = T, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    options<T = any, R = T, D = any>(
      url: string,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    post<T = any, R = T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    put<T = any, R = T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
    patch<T = any, R = T, D = any>(
      url: string,
      data?: D,
      config?: AxiosRequestConfig<D>,
    ): Promise<R>;
  }

  // 2. Định nghĩa lại AxiosResponse để giữ nguyên
  //    cho logic bên trong interceptor
  //    (Xóa cái `extends Promise<T>` cũ đi)
  export interface AxiosResponse<T = any, D = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig<D>;
    request?: any;
  }
}