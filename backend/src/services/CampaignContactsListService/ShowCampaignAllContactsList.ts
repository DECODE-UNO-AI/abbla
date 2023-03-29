import CampaignContactsList from "../../models/CampaignContactsList";
import Contact from "../../models/Contact";

const ShowCampaignAllContactsList = async (campaignContactsListId: string | number) => {

  const contacts = await Contact.findAll({
    include: [
      {
        model: CampaignContactsList,
        where: {
          id: campaignContactsListId
        }
      },
    ],
  })
  return contacts;
}

export default ShowCampaignAllContactsList;
