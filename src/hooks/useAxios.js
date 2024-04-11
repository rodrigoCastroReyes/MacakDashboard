import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useAxios = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      setData(response.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetchData();
    }

    // Cleanup function to cancel the request if the component unmounts
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useAxios;
