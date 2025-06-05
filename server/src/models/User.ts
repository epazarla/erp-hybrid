export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface UserInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}
