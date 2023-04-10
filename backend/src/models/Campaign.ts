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
  Default,
  HasMany,
  AllowNull
} from "sequelize-typescript";
import CampaignContact from "./CampaignContact";
import User from "./User";
import Whatsapp from "./Whatsapp";
import WhatsappApi from "./WhatsappApi";

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

  @Column(DataType.STRING)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set sendTime(value) {
    this.setDataValue("sendTime", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get sendTime(): any {
    return JSON.parse(this.getDataValue("sendTime"));
  }

  @Column
  startNow: boolean;

  @Default(0)
  @Column
  contactsNumber: number;

  @Default(0)
  @Column
  contactsSent: number;

  @Default(0)
  @Column
  contactsFailed: number;

  @Column
  contactsListId: number;

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
      "failed",
      "archived"
    )
  )
  status: string;

  @Default("15-30")
  @Column(
    DataType.ENUM("1-5", "5-10", "10-15", "15-30", "30-60", "60-120", "120-240")
  )
  delay: string;

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set message1(value) {
    this.setDataValue("message1", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get message1(): any {
    return JSON.parse(this.getDataValue("message1"));
  }

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set message2(value) {
    this.setDataValue("message2", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get message2(): any {
    return JSON.parse(this.getDataValue("message2"));
  }

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set message3(value) {
    this.setDataValue("message3", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get message3(): any {
    return JSON.parse(this.getDataValue("message3"));
  }

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set message4(value) {
    this.setDataValue("message4", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get message4(): any {
    return JSON.parse(this.getDataValue("message4"));
  }

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set message5(value) {
    this.setDataValue("message5", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get message5(): any {
    return JSON.parse(this.getDataValue("message5"));
  }

  @Column
  columnName: string;

  @Column
  contactsCsv: string;

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

  @ForeignKey(() => WhatsappApi)
  @Column
  whatsappApiId: number;

  @BelongsTo(() => WhatsappApi)
  whatsappApi: WhatsappApi;

  @HasMany(() => CampaignContact)
  campaignContacts: CampaignContact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Campaign;
