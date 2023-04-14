import CampaignContactsList from "../../models/CampaignContactsList"

const ListCampaignContactsListsService = async () => {

  const lists = await CampaignContactsList.findAll();

  return lists;

}

export default ListCampaignContactsListsService;
