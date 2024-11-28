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
      // Make the API request
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/fbuid?url=${encodeURIComponent(url)}`);
      
      // Log the API response for debugging
      console.log('API Response:', response.data);

      // Extract UID from the response
      if (response.data && response.data.uid) {
        const uid = response.data.uid;
        const successMessage = `
✔️ Facebook UID fetched successfully:
**URL**: ${url}
**UID**: ${uid}`;
        sendMessage(senderId, { text: successMessage }, pageAccessToken);
      } else {
        // Handle missing or invalid UID in the API response
        sendMessage(senderId, { text: '⚠️ Unable to fetch UID. Please check the URL and try again.' }, pageAccessToken);
      }
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching UID:', error);

      const errorMessage = `
❌ An error occurred while fetching the UID.
**Details**: ${error.response?.data?.message || error.message || 'Unknown error'}`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  }
};
