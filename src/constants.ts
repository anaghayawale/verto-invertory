export const DB_NAME = "verto-inventory"

export enum Roles {
  ADMIN = "admin",
  USER = "user",
}

export enum Actions {
  ADD = "add",           
  REMOVE = "remove"        
}

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
