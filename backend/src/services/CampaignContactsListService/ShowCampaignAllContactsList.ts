import CampaignContactsList from "../../models/CampaignContactsList";
import Contact from "../../models/Contact";

const ShowCampaignAllContactsList = async (campaignContactsListId: string | number, allContacts = false, pageNumber = "1") => {

  const limit = 50;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    limit: allContacts ? undefined : limit,
    offset: allContacts ? undefined : offset,
    include: [
      {
        model: CampaignContactsList,
        attributes: [],
        where: {
          id: campaignContactsListId
        }
      },
    ],
  })
  const hasMore = count > offset + contacts.length;

  return {contacts, count, hasMore};
}

export default ShowCampaignAllContactsList;
