function isEmptyValue(value: unknown): boolean {
    return (value === null || value === undefined || value === '');
}

function isNumber(value: unknown): boolean {
  return typeof value === "number" && !isNaN(value);
}

export { isEmptyValue, isNumber }