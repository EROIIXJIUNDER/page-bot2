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
      const apiUrl = `https://kaiz-apis.gleeze.com/api/fbuid?url=${encodeURIComponent(url)}`;
      console.log(`Fetching UID from: ${apiUrl}`); // Debug log

      const response = await axios.get(apiUrl);
      console.log('API Response:', response.data); // Debug log

      if (response.data && response.data.uid) {
        const uid = response.data.uid;
        const successMessage = `
✔️ Facebook UID fetched successfully:
**URL**: ${url}
**UID**: ${uid}`;
        sendMessage(senderId, { text: successMessage }, pageAccessToken);
      } else {
        sendMessage(senderId, { text: '⚠️ Unable to fetch UID. Please check the URL and try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching UID:', error.response?.data || error.message); // Debug log

      const errorMessage = `
❌ An error occurred while fetching the UID.
**Details**: ${error.response?.data?.message || error.message || 'Unknown error'}
**API URL**: ${url}`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};
