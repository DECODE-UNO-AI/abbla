import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";
import User from "./User";

@Table
class ScheduledMessage extends Model<ScheduledMessage> {
  @PrimaryKey
  @Column
  id: number;

  @Column(DataType.TEXT)
  body: string;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @Column
  inicialDate: Date;

  @Default("pending")
  @Column(DataType.ENUM("scheduled", "sent", "failed"))
  status: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @ForeignKey(() => Contact)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket, "contactId")
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User, "userId")
  user: User;
}

export default ScheduledMessage;
