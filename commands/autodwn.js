const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'autoDownload',
  description: 'Automatically download videos from various platforms',
  usage: 'autoDownload [video URL]',
  author: 'Your Name',

  async execute(senderId, args, pageAccessToken) {
    // Validate that a URL is provided
    if (!args.length) {
      sendMessage(senderId, { text: 'Please provide a video URL to download.' }, pageAccessToken);
      return;
    }

    // Extract the video URL from the arguments
    const videoUrl = args[0];

    try {
      // Send initial processing message
      sendMessage(senderId, { text: '🔍 Processing your video download request...' }, pageAccessToken);

      // Make request to the AIO downloader API
      const downloadResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(videoUrl)}`, {
        // Optional: Set a longer timeout for potentially slow downloads
        timeout: 30000
      });

      // Check if download was successful and data exists
      if (!downloadResponse.data || downloadResponse.data.length === 0) {
        sendMessage(senderId, { text: '❌ No downloadable content found for the provided URL.' }, pageAccessToken);
        return;
      }

      // Select the first available download link (typically highest quality)
      const downloadLink = downloadResponse.data[0]?.url;
      const videoTitle = downloadResponse.data[0]?.title || 'Downloaded Video';

      if (!downloadLink) {
        sendMessage(senderId, { text: '❌ Unable to retrieve download link.' }, pageAccessToken);
        return;
      }

      // Send video as attachment
      sendMessage(
        senderId,
        {
          attachment: { 
            type: 'video', 
            payload: { 
              url: downloadLink, 
              is_reusable: true 
            }
          }
        },
        pageAccessToken
      );

      // Optional: Send additional metadata if available
      if (downloadResponse.data[0]?.duration) {
        sendMessage(
          senderId, 
          { text: `📊 Video Details:\nTitle: ${videoTitle}\nDuration: ${downloadResponse.data[0].duration}` }, 
          pageAccessToken
        );
      }

    } catch (error) {
      console.error('Video Download Error:', error);

      // Provide user-friendly error messages
      if (error.response) {
        // The request was made and the server responded with a status code
        sendMessage(
          senderId, 
          { text: `❌ Download failed. Server responded with ${error.response.status} status.` }, 
          pageAccessToken
        );
      } else if (error.request) {
        // The request was made but no response was received
        sendMessage(
          senderId, 
          { text: '❌ No response received from the download server. Please try again later.' }, 
          pageAccessToken
        );
      } else {
        // Something happened in setting up the request
        sendMessage(
          senderId, 
          { text: '❌ An unexpected error occurred during download. Please check the URL and try again.' }, 
          pageAccessToken
        );
      }
    }
  }
};
