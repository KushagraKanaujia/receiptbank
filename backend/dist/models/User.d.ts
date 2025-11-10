import { Model, Optional } from 'sequelize';
interface UserAttributes {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'business';
    isEmailVerified: boolean;
    totalEarnings: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'totalEarnings' | 'isEmailVerified'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'business';
    isEmailVerified: boolean;
    totalEarnings: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default User;
//# sourceMappingURL=User.d.ts.map