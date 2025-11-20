// src/api/category.ts
import axios from '@/utils/axios.customize';
import { Category } from '@/types/category.types';

export const getAllCategories = (): Promise<Category[]> => {
  return axios.get('/api/categories');
};