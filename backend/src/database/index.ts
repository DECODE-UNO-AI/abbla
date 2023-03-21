import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import Queue from "../models/Queue";
import WhatsappQueue from "../models/WhatsappQueue";
import UserQueue from "../models/UserQueue";
import QuickAnswer from "../models/QuickAnswer";
import Tag from "../models/Tag";
import ContactTag from "../models/ContactTag";
import Departament from "../models/Departament";
import DepartamentQueue from "../models/DepartamentQueue";
import UserDepartament from "../models/UserDepartament";
import Campaign from "../models/Campaign";
import CampaignContact from "../models/CampaignContact";
import ScheduledMessage from "../models/ScheduledMessage";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  Setting,
  Queue,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  Tag,
  ContactTag,
  Departament,
  DepartamentQueue,
  UserDepartament,
  Campaign,
  CampaignContact,
  ScheduledMessage
];

sequelize.addModels(models);

export default sequelize;
