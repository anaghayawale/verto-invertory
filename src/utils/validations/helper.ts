function isEmptyValue(value: unknown): boolean {
    return (value === null || value === undefined || value === '');
}

function isNonEmptyString(value: unknown, maxLength: number, field: string): string | null {
  if (typeof value !== "string") return `${field} must be a string`;
  if (value.trim().length === 0) return `${field} cannot be empty`;
  if (value.length > maxLength) return `${field} cannot exceed ${maxLength} characters`;
  return null;
}

function isNumber(value: unknown, field: string, { min, max, integer }: { min?: number; max?: number; integer?: boolean } = {}): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return `${field} must be a number`;
  if (min !== undefined && value < min) return `${field} cannot be less than ${min}`;
  if (max !== undefined && value > max) return `${field} cannot be less than ${max}`
  if (integer && !Number.isInteger(value)) return `${field} must be an integer`;
  return null;
}

function isValidPassword(password: unknown): string | null {
  if (typeof password !== "string") return "Password must be a string";
  if (isEmptyValue(password)) return "Password is required";

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!regex.test(password)) {
    return "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and be at least 8 characters long";
  }
  return null;
}

export { isEmptyValue, isNumber, isNonEmptyString, isValidPassword }