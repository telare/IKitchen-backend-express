import { User, UserDB } from "@shared/types/user";
export declare function getAllUsers(): Promise<UserDB[] | undefined>;
export declare function getUser(email: string): Promise<UserDB | undefined>;
export declare function setUser(userData: User): Promise<{
    name: string;
    id: string;
    email: string;
    password: string;
} | undefined>;
//# sourceMappingURL=user.d.ts.map