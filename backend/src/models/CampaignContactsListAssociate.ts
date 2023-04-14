import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  ForeignKey
} from "sequelize-typescript";
import Contact from "./Contact";
import CampaignContactsList from "./CampaignContactsList";

@Table({
  tableName: "CampaignContactsListAssociates"
})
class CampaignContactsListAssociate extends Model<CampaignContactsListAssociate> {
  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => CampaignContactsList)
  @Column
  campaigncontactslistId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignContactsListAssociate;
