import {
  Table,
  Column,
  DataType,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import User from "./User";

@Table
class Macro extends Model<Macro> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  shortcut: string;

  @Column(DataType.TEXT)
  set message1(value) {
    this.setDataValue("message1", JSON.stringify(value));
  }

  get message1(): any {
    return JSON.parse(this.getDataValue("message1"));
  }

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Macro;
