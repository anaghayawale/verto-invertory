import { Roles } from "../../constants";
import { isNonEmptyString, isValidPassword } from "./helper";
import { validationResult } from "./helper";

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData extends LoginData {
  role: Roles;
}

export function validateLoginData(data: LoginData): validationResult {
  const errors: string[] = [];

  const usernameError = isNonEmptyString(data.username, 30, "Username");
  if (usernameError) errors.push(usernameError);

  const passwordError = isValidPassword(data.password);
  if (passwordError) errors.push(passwordError);

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRegisterData(data: RegisterData): validationResult {
  const errors: string[] = [];

  const usernameError = isNonEmptyString(data.username, 30, "Username");
  if (usernameError) errors.push(usernameError);

  const passwordError = isValidPassword(data.password);
  if (passwordError) errors.push(passwordError);

  if (!data.role || !Object.values(Roles).includes(data.role)) {
    errors.push(
      `Role is required and must be one of: ${Object.values(Roles).join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}