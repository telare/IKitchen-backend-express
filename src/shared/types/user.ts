export type UserDB = {
  id: string;
  name: string;
  email: string;
};
export type UserProviderCredentials = {
  provider: string;
  password: string | null;
  providerAccountID: string | null;
};
export type LocalUser = {
  userID: string;
  password: string;
};
export type OauthUser = {
  userID: string;
  provider: string;
  providerAccountID: string;
};
