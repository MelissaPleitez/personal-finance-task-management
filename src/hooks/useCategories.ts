import api from "@/lib/axios";
import type { Category } from "@/types/category.types";
import { useEffect, useState } from "react";

const useCategories = () => {
  // states: categories, loading, error
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // fetch GET /categories on mount
  const fetchCategories = async () => {
    try {
        setLoading(true);
        const response = await api.get<Category[]>('/categories');
        setCategories(response.data);
    } catch {
        setError('Failed to fetch categories. Please try again later.');
    }finally{
        setLoading(false);
    }
  }

  useEffect(()=>{
    fetchCategories();
  }, [])

  return { categories, loading, error,  systemCategories: categories.filter(c => c.isSystem),    // ← filter here
  userCategories: categories.filter(c => !c.isSystem), refetch: fetchCategories }
}

export default useCategories;
