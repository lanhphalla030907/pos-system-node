import { useState, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, generateBarcode } from '../api/productApi';

const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const loadProducts = useCallback(async (filter = {}) => {
    try {
      setLoading(true);
      const res = await getProducts(filter);
      
      if (res?.success) {
        setProducts(res.data || []);
       
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setProducts([]);
      }
      
      return res;
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  //  NEW: Refresh stock after order
  const refreshStock = useCallback(async () => {
    await loadProducts({ page: pagination.currentPage, limit: pagination.limit });
  }, [loadProducts, pagination.currentPage, pagination.limit]);

  const addProduct = useCallback(async (data) => {
    try {
      setLoading(true);
      const res = await createProduct(data);
      return res;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editProduct = useCallback(async (id, data) => {
    try {
      setLoading(true);
      const res = await updateProduct(id, data);
      return res;
    } catch (err) {
      console.error('Error editing product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await deleteProduct(id);
      return res;
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBarcode = useCallback(async () => {
    try {
      const res = await generateBarcode();
      return res;
    } catch (err) {
      console.error('Error generating barcode:', err);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    pagination,
    loadProducts,
    refreshStock, 
    addProduct,   
    editProduct,  
    removeProduct, 
    getBarcode,   
  };
};

export default useProduct;