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
  BelongsToMany
} from "sequelize-typescript";
import Departament from "./Departament";
import DepartamentQueue from "./DepartamentQueue";
import User from "./User";
import UserQueue from "./UserQueue";

import Whatsapp from "./Whatsapp";
import WhatsappQueue from "./WhatsappQueue";

@Table
class Queue extends Model<Queue> {
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
  color: string;

  @Column
  greetingMessage: string;

  @Column
  startWork: string;

  @Column
  endWork: string;

  @Column
  absenceMessage: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Array<Whatsapp & { WhatsappQueue: WhatsappQueue }>;

  @BelongsToMany(() => Departament, () => DepartamentQueue)
  departaments: Array<Departament & { DepartamentQueue: DepartamentQueue }>;

  @BelongsToMany(() => User, () => UserQueue)
  users: Array<User & { UserQueue: UserQueue }>;
}

export default Queue;
