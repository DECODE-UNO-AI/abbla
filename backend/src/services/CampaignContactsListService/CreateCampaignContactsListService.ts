import CampaignContactsList from "../../models/CampaignContactsList";
import ListFilteredContatsService from "../ContactServices/ListFilteredContatsService";

interface ListData {
  name: string;
  filterOptions: any;
}


const CreateCampaignContactsListService = async (listData: ListData) => {

  const { contacts } = await ListFilteredContatsService({ allContacts: true, filterOptions: listData.filterOptions })

  const contactsIds = contacts.map(c => c.id)

  const newList = await CampaignContactsList.create({ name: listData.name }, { include: ["contacts"] })

  await newList.$set("contacts", contactsIds);

  return newList;
}

export default CreateCampaignContactsListService;
