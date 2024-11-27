const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'autodownload',
  description: 'Automatically download and send a video from a link.',
  usage: 'autodownload [link]',
  author: 'Asmit',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      sendMessage(senderId, { text: 'Please provide a valid link to download.' }, pageAccessToken);
      return;
    }

    const url = args[0];
    const apiEndpoint = `https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(url)}`;

    try {
      // Step 1: Fetch the video download link from the API
      const response = await axios.get(apiEndpoint);
      const videoUrl = response.data?.video?.url; // Adjust based on the API response structure

      if (!videoUrl) {
        sendMessage(senderId, { text: 'Sorry, no downloadable video found for the provided link.' }, pageAccessToken);
        return;
      }

      // Step 2: Check video file size
      const videoStreamResponse = await axios.head(videoUrl); // HEAD request to check file details
      const fileSize = parseInt(videoStreamResponse.headers['content-length'], 10);

      if (fileSize > 25 * 1024 * 1024) { // If file size exceeds 25MB
        sendMessage(
          senderId,
          {
            text: `📹 The video is too large to send directly. You can download it here: ${videoUrl}`,
          },
          pageAccessToken
        );
      } else {
        // Step 3: Send video directly as an attachment
        sendMessage(
          senderId,
          {
            attachment: {
              type: 'video',
              payload: {
                url: videoUrl,
                is_reusable: true,
              },
            },
          },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error('Error downloading video:', error.message);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request. Please try again later.' }, pageAccessToken);
    }
  },
};
