export const useLocalStorage = (key, initialValue) => {
  const storedValue = localStorage.getItem(key);
  const value = storedValue ? JSON.parse(storedValue) : initialValue;

  const setValue = (val) => {
    if (val === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  return [value, setValue];
};

export const useSessionStorage = (key, initialValue) => {
  const storedValue = sessionStorage.getItem(key);
  const value = storedValue ? JSON.parse(storedValue) : initialValue;

  const setValue = (val) => {
    if (val === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(val));
    }
  };

  return [value, setValue];
};

export default { useLocalStorage, useSessionStorage };
