const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'download',
  description: 'Download video from a given URL',
  usage: 'download [Video URL]',
  author: 'Asmit Adk',
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      const errorMessage = `
⚠️ Missing URL. Please provide a valid video URL.
**Usage**: download [Video URL]`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
      return;
    }

    const url = args[0];
    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(url)}`;
      console.log(`Fetching video details from: ${apiUrl}`); // Debug log

      // Fetch video details
      const response = await axios.get(apiUrl);
      const videoData = response.data;

      if (videoData && videoData.download_url) {
        const videoUrl = videoData.download_url;
        const videoTitle = videoData.title || 'video';

        // Download the video
        const videoPath = path.join(__dirname, `../downloads/${videoTitle}.mp4`);
        const videoStream = fs.createWriteStream(videoPath);

        const downloadResponse = await axios({
          method: 'get',
          url: videoUrl,
          responseType: 'stream',
        });

        downloadResponse.data.pipe(videoStream);

        videoStream.on('finish', () => {
          const successMessage = `
✔️ Video downloaded successfully!
**Title**: ${videoTitle}
**Path**: ${videoPath}`;
          sendMessage(senderId, { text: successMessage }, pageAccessToken);
        });

        videoStream.on('error', (err) => {
          console.error('Error writing video to file:', err);
          sendMessage(senderId, { text: '❌ Error downloading video.' }, pageAccessToken);
        });
      } else {
        sendMessage(senderId, { text: '⚠️ Unable to fetch video details. Please check the URL and try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error downloading video:', error.response?.data || error.message); // Debug log

      const errorMessage = `
❌ An error occurred while fetching or downloading the video.
**Details**: ${error.response?.data?.message || error.message || 'Unknown error'}`;
      sendMessage(senderId, { text: errorMessage }, pageAccessToken);
    }
  },
};
