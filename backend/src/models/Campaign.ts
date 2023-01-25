import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  Default
} from "sequelize-typescript";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  inicialDate: Date;

  @Column
  sendTime: string;

  @Column
  startNow: boolean;

  @Default(0)
  @Column
  lastLineContact: number;

  @Default("pending")
  @Column(
    DataType.ENUM(
      "pending",
      "paused",
      "scheduled",
      "timeout",
      "processing",
      "canceled",
      "finished",
      "failed"
    )
  )
  status: string;

  @Default("15-30")
  @Column(
    DataType.ENUM("1-5", "5-10", "10-15", "15-30", "30-60", "60-120", "120-240")
  )
  delay: string;

  @Column
  message1: string;

  @Column
  message2: string;

  @Column
  message3: string;

  @Column
  message4: string;

  @Column
  message5: string;

  @Column
  columnName: string;

  @Column
  contactsCsv: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const value = this.getDataValue("mediaUrl");
    if (value && value !== "null") {
      const { BACKEND_URL } = process.env;
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Campaign;
