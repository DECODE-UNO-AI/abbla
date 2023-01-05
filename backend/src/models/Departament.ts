import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  HasMany,
  BelongsToMany
} from "sequelize-typescript";
import DepartamentQueue from "./DepartamentQueue";
import Queue from "./Queue";
import User from "./User";
import UserQueue from "./UserQueue";
import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";
import UserDepartament from "./UserDepartament";

@Table
class Departament extends Model<Departament> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Unique
  @Column
  name: string;

  @AllowNull(false)
  @Column
  description: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Queue, () => DepartamentQueue)
  queues: Queue[];

  @BelongsToMany(() => User, () => UserDepartament)
  user: User[];
}

export default Departament;
