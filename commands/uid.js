const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'fbuid',
  description: 'Fetch the Facebook UID of a profile or page using its URL',
  usage: 'fbuid [Facebook URL]',
  author: 'Asmit Adk',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      const errorMessage = `
⚠️ Missing URL. Please provide a valid Facebook URL.
**Usage**: fbuid [Facebook URL]`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
      return;
    }

    const url = args[0];
    try {
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/fbuid?url=${encodeURIComponent(url)}`);
      const { uid } = response.data;

      if (uid) {
        const successMessage = `
✔️ Facebook UID fetched successfully:
**URL**: ${url}
**UID**: ${uid}`;
        sendMessage(senderId, { text: successMessage }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: '⚠️ Unable to fetch UID. Please check the URL and try again.' }, pageAccessToken);
      }
    } catch (error) {
      const errorMessage = `
❌ An error occurred while fetching the UID.
**Details**: ${error.message || 'Unknown error'}`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};
