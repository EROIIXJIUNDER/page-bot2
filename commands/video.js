const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'video',
  description: 'Search and play videos.',
  usage: 'video [video name]',
  author: 'Asmit',

  async execute(senderId, args, pageAccessToken) {
    if (!args.length) {
      sendMessage(senderId, { text: 'Please provide a video name to search for.' }, pageAccessToken);
      return;
    }

    try {
      // Step 1: Search for the video
      const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(args.join(' '))}`);
      const videoId = searchResponse.data[0]?.videoId;
      const title = searchResponse.data[0]?.title;

      if (!videoId) {
        sendMessage(senderId, { text: 'Sorry, no video found for your query.' }, pageAccessToken);
        return;
      }

      // Step 2: Get the download link
      const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${videoId}`);
      const videoUrl = downloadResponse.data[0];

      if (!videoUrl) {
        sendMessage(senderId, { text: 'Sorry, failed to retrieve the video.' }, pageAccessToken);
        return;
      }

      // Step 3: Send the video as an attachment
      sendMessage(
        senderId,
        {
          text: `📹 Here is your video: ${title}\nDownload: ${videoUrl}`,
          attachment: { type: 'video', payload: { url: videoUrl, is_reusable: true } },
        },
        pageAccessToken
      );
    } catch (error) {
      console.error('Error fetching video:', error.message);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request. Please try again later.' }, pageAccessToken);
    }
  }
};
