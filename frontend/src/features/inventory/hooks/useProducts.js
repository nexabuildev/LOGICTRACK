import { useState, useEffect } from 'react';
import { API_URL } from '../../../api/config';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchProducts = () => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => setError(err.message));
  };

  useEffect(() => { fetchProducts(); }, []);
  return { products, error, refreshProducts: fetchProducts };
};