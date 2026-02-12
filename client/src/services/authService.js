let logoutFn;

export const setLogout = (fn) => {
  logoutFn = fn;
};

export const logout = () => {
  if (logoutFn) logoutFn();
};
