import CampaignContactsList from "../../models/CampaignContactsList"

const DeleteCampaignContactsList = async (campaignContactsListId: string | number) => {

  const list = await CampaignContactsList.findByPk(+campaignContactsListId);

  if (!list) {
    return
  }
  await list.update({
    actived: false
  })

  return

}

export default DeleteCampaignContactsList;
