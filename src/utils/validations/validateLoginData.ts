import { Roles } from "../../constants";
import { isNonEmptyString, isValidPassword } from "./helper";

function validateLoginData(
  username: string,
  password: string,
  isLogin: boolean = false,
  role?: Roles
) {
  const errors: string[] = [];

  const usernameError = isNonEmptyString(username, 30, "Username");
  if (usernameError) errors.push(usernameError);

  const passwordError = isValidPassword(password);
  if (passwordError) errors.push(passwordError);

  if (!isLogin) {
    if (!role || !Object.values(Roles).includes(role)) {
      errors.push(
        `Role is required and must be one of: ${Object.values(Roles).join(", ")}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export { validateLoginData };
