/* eslint-disable import/no-extraneous-dependencies */
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.CHATGPT_API_KEY
});
const openai = new OpenAIApi(configuration);

export default openai;
