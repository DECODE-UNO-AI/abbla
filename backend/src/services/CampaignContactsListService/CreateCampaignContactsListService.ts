import CampaignContactsList from "../../models/CampaignContactsList";

interface ListData {
  name: string;
  contactsIds: number[];
}


const CreateCampaignContactsListService = async (listData: ListData) => {

  const newList = await CampaignContactsList.create({ name: listData.name }, { include: ["contacts"] })

  await newList.$set("contacts", listData.contactsIds);

  return newList;
}

export default CreateCampaignContactsListService;
