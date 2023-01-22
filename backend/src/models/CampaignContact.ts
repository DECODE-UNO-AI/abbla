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
} from "sequelize-typescript";
import Campaign from "./Campaign";

@Table
class CampaignContact extends Model<CampaignContact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default("pending")
  @Column(
    DataType.ENUM("pending", "processing", "failed", "canceled", "finished")
  )
  status: string;

  @Column
  number: string;

  @ForeignKey(() => Campaign)
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignContact;
