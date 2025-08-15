export type UserDB = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type User = Omit<UserDB, "id">;
