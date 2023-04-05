import { Op } from "sequelize";
import CampaignContactsListAssociate from "../../models/CampaignContactsListAssociate";

const DeleteContactFromCampaignContactsListService = async (contactId: string | number, listId: string | number) => {

  await CampaignContactsListAssociate.destroy({ where: {[Op.and]: [{campaigncontactslistId: +listId}, {contactId: +contactId} ]}});

  return

}

export default DeleteContactFromCampaignContactsListService;
