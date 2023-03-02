import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
} from "sequelize-typescript";

@Table
class WhatsappApi extends Model<WhatsappApi> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Unique
  @Column(DataType.TEXT)
  sessionId: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Unique
  @Column
  name: string;

  @Column
  number: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default WhatsappApi;
