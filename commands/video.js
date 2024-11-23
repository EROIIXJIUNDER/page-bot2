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

      // Step 2: Get the download link (direct video URL)
      const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${videoId}`);
      const videoUrl = downloadResponse.data[0];

      if (!videoUrl) {
        sendMessage(senderId, { text: 'Sorry, failed to retrieve the video.' }, pageAccessToken);
        return;
      }

      // Check if video URL is downloadable and not too large
      // Assuming videoUrl is a direct file URL that can be streamed
      // Messenger accepts video attachment URLs, and typically video files should be under 25MB

      const videoStreamResponse = await axios.head(videoUrl); // Make a HEAD request to check file size
      const fileSize = parseInt(videoStreamResponse.headers['content-length'], 10);

      // If file size exceeds Messenger's limit (around 25MB), send the download link instead
      if (fileSize > 25 * 1024 * 1024) { // 25MB in bytes
        sendMessage(
          senderId,
          {
            text: `📹 The video is too large to send directly. You can download it here: ${videoUrl}`
          },
          pageAccessToken
        );
      } else {
        // Step 3: Send the video as an attachment
        sendMessage(
          senderId,
          {
            text: `📹 Here is your video: ${title}`,
            attachment: { type: 'video', payload: { url: videoUrl, is_reusable: true } }
          },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error('Error fetching video:', error.message);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request. Please try again later.' }, pageAccessToken);
    }
  }
};
