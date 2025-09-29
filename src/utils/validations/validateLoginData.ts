import { Roles } from "../../constants";

function validateLoginData(
    username: string,
    password: string,
    isLogin: boolean = false,
    role?: Roles,
){
  const errors: string[] = [];

  if (!username || username.trim().length === 0) {
    errors.push("Username is required");
  } else {
    const trimmed = username.trim();
    if (trimmed.length < 3) errors.push("Username must be at least 3 characters");
    if (trimmed.length > 30) errors.push("Username cannot exceed 30 characters");
  }

  if (!password || password.length === 0) {
    errors.push("Password is required");
  } else {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.push(
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and be at least 8 characters long"
      );
    }
  }

  if (!isLogin) {
    if (!role || !Object.values(Roles).includes(role)) {
      errors.push(`Role is required and must be one of: ${Object.values(Roles).join(", ")}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export { validateLoginData }