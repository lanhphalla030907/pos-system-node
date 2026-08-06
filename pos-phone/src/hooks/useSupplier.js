import { useEffect, useState } from "react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../api/supplierApi";

const useSupplier = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadSuppliers = async (search = "") => {
    try {
      setLoading(true);
      const res = await getSuppliers(search);
      setSuppliers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const addSupplier = async (formData) => {
    try {
      const res = await createSupplier(formData);
      await loadSuppliers();
      return res;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  const editSupplier = async (id, formData) => {
    try {
      const res = await updateSupplier(id, formData);

      await loadSuppliers();

      return res;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  const removeSupplier = async (id) => {
    try {
      const res = await deleteSupplier(id);

      await loadSuppliers();

      return res;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    removeSupplier,
    editSupplier,
    loadSuppliers,
    addSupplier,
  };
};
export default useSupplier;
