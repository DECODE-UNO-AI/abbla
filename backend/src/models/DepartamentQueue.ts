import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Departament from "./Departament";
import Queue from "./Queue";

@Table
class DepartamentQueue extends Model<DepartamentQueue> {
  @ForeignKey(() => Departament)
  @Column
  departamentId: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default DepartamentQueue;
