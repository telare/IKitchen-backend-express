export type UserDB = {
  id: string;
  name: string;
  email: string;
};
export type UserProviderCredentials = {
  provider: string;
  password: string | null;
  providerAccountID: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};
export type LocalUser = {
  userId: string;
  password: string;
};
export type OauthUser = {
  userId: string;
  provider: string;
  providerAccountID: string;
};
