import { useState, useEffect } from "react";
import axios from "axios";

const usePostAxios = (url,body) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const postData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(url,body);
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

  useEffect(() => {
    if (url) {
      postData();
    }
    // Cleanup function to cancel the request if the component unmounts
    return () => {};
  }, [url]);

  return { data, loading, error };
};

export default usePostAxios;
