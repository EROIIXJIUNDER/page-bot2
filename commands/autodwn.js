const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { sendMessage, sendAttachment } = require('../handles/sendMessage');

module.exports = {
  name: 'download',
  description: 'Download a video from a given URL and send it as an MP4 file.',
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
      // Fetch video details from the API
      const apiUrl = `https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(url)}`;
      console.log(`Fetching video details from: ${apiUrl}`); // Debug log

      const response = await axios.get(apiUrl);
      const videoData = response.data;

      if (videoData && videoData.download_url) {
        const videoUrl = videoData.download_url;
        const videoTitle = videoData.title || 'video';
        const videoPath = path.join(__dirname, `../downloads/${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`);

        // Download the video
        const downloadResponse = await axios({
          method: 'get',
          url: videoUrl,
          responseType: 'stream',
        });

        const writer = fs.createWriteStream(videoPath);
        downloadResponse.data.pipe(writer);

        writer.on('finish', async () => {
          console.log('Video downloaded:', videoPath);

          // Send the video as an attachment
          const successMessage = `✔️ Video downloaded successfully! Sending the file now...`;
          await sendMessage(senderId, { text: successMessage }, pageAccessToken);

          const formData = {
            message: '🎥 Here is your video:',
            file: {
              value: fs.createReadStream(videoPath),
              options: {
                filename: path.basename(videoPath),
                contentType: 'video/mp4',
              },
            },
          };

          await sendAttachment(senderId, formData, pageAccessToken);

          // Cleanup: Delete the file after sending
          fs.unlinkSync(videoPath);
        });

        writer.on('error', (err) => {
          console.error('Error writing video file:', err);
          sendMessage(senderId, { text: '❌ Error downloading the video. Please try again later.' }, pageAccessToken);
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
