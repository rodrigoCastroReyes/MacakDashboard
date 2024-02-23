import { useState, useEffect } from "react";
import axios from "axios";

const useGetAuthAxios = (url,jwt) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getData = async () => {
    try {
      setLoading(true);
      setError(null);

        const response = await axios.get(url,{
          headers: {
            'Authorization': jwt 
          }
        });

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
      getData();
    }
    // Cleanup function to cancel the request if the component unmounts
    return () => {};
  }, [url]);

  const refetch = async () => {
    await getData();
  };

  return { data, loading, error,refetch};
};

export default useGetAuthAxios;