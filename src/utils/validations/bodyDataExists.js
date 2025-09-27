const bodyDataExists = (...fields) => {
    const res =
      [...fields].includes(undefined) ||
      [...fields].some((item) => item.trim() === "");
    return res;
};
  
export { bodyDataExists };