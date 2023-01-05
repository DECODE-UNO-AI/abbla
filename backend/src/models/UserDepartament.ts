import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Departament from "./Departament";
import User from "./User";

@Table
class UserDepartament extends Model<UserDepartament> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => Departament)
  @Column
  departamentId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default UserDepartament;
