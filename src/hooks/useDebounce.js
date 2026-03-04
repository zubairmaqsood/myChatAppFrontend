import { useEffect ,useState} from "react";

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay);

    return () => {
      clearInterval(handler);
    };
  }, [value, delay]);
  return debouncedValue
};
