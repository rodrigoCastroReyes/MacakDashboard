import { useState, useEffect } from "react";
import axios from "axios";

const useAxios = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
    };

    if (url) {
      fetchData();
    }

    // Cleanup function to cancel the request if the component unmounts
    return () => {};
  }, [url]);

  return { data, loading, error };
};

export default useAxios;
