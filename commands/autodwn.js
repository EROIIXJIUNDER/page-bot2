const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'autodownload',
  description: 'Automatically downloads video links sent by the user',
  usage: 'Send a video link, and it will auto-download.',
  author: 'Asmit',
  async execute(senderId, args, pageAccessToken, event) {
    const userMessage = event.message.text;

    // Check if the message contains a valid URL
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const foundUrl = userMessage.match(urlRegex);

    if (!foundUrl) {
      return; // Exit if no URL is found in the user's message.
    }

    const videoUrl = foundUrl[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(videoUrl)}`;

    try {
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        const videoDownloadUrl = response.data.data.download[0].url;
        const videoTitle = response.data.data.title || 'Downloaded Video';

        // Send the video back to the user
        sendMessage(
          senderId,
          {
            text: `🎥 **${videoTitle}**\n\n📥 Downloading...`,
            attachment: { type: 'file', payload: { url: videoDownloadUrl } },
          },
          pageAccessToken
        );
      } else {
        sendMessage(senderId, { text: '⚠️ Unable to download the video. Please check the URL.' }, pageAccessToken);
      }
    } catch (error) {
      sendMessage(senderId, { text: `⚠️ An error occurred: ${error.message}` }, pageAccessToken);
    }
  },
};
