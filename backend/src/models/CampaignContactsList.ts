import {
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt
} from "sequelize-typescript";

import CampaignContactsListAssociate from "./CampaignContactsListAssociate";
import Contact from "./Contact";


@Table
class CampaignContactsList extends Model<CampaignContactsList> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => Contact, () => CampaignContactsListAssociate)
  contacts: Contact[];
}

export default CampaignContactsList;
