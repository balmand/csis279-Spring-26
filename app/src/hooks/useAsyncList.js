import { useCallback, useEffect, useState } from 'react';

export const useAsyncList = (loadItems, removeItem) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await loadItems();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load data.');
    } finally {
      setIsLoading(false);
    }
  }, [loadItems]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const removeById = async (id) => {
    try {
      await removeItem(id);
      await refresh();
    } catch {
      setError('Unable to update data.');
    }
  };

  return {
    items,
    isLoading,
    error,
    refresh,
    removeById,
    setItems,
  };
};
