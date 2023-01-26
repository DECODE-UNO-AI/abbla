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
import Campaign from "./Campaign";

@Table
class CampaignContact extends Model<CampaignContact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default("pending")
  @Column(
    DataType.ENUM("pending", "processing", "failed", "invalid-number", "sent")
  )
  status: string;

  @Column(DataType.TEXT)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  set details(value) {
    this.setDataValue("details", JSON.stringify(value));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get details(): any {
    return JSON.parse(this.getDataValue("details"));
  }

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
