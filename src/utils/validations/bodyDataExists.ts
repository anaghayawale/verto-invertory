function bodyDataExists(...fields: (string | number | undefined)[]): boolean {
  return fields.includes(undefined) || fields.some((item) => {
    if (typeof item === "string") {
      return item.trim() === "";
    }
    return false;
  });
};

export { bodyDataExists }