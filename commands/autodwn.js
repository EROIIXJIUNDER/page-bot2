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
      return sendMessage(senderId, { text: 'Please provide a video URL to download.' }, pageAccessToken);
    }

    const videoUrl = args[0];

    try {
      // Send initial processing message
      await sendMessage(senderId, { text: '🔍 Processing your video download request...' }, pageAccessToken);

      // Make request to the AIO downloader API
      const downloadResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/aio-downloader?url=${encodeURIComponent(videoUrl)}`, {
        timeout: 30000
      });

      // Detailed logging of API response
      console.log('Full API Response:', JSON.stringify(downloadResponse.data, null, 2));

      // Comprehensive data validation
      if (!downloadResponse.data) {
        return sendMessage(senderId, { text: '❌ No data received from download service.' }, pageAccessToken);
      }

      // Handle different response structures
      const downloadLinks = Array.isArray(downloadResponse.data) 
        ? downloadResponse.data 
        : [downloadResponse.data];

      // Find first valid download link
      const validDownload = downloadLinks.find(item => 
        item && (item.url || item.downloadUrl || item.link)
      );

      if (!validDownload) {
        return sendMessage(
          senderId, 
          { 
            text: '❌ Unable to retrieve download link. Possible reasons:\n' +
                  '- Unsupported platform\n' +
                  '- Invalid URL\n' +
                  '- Temporary service issues' 
          }, 
          pageAccessToken
        );
      }

      // Extract download link with fallback
      const downloadLink = 
        validDownload.url || 
        validDownload.downloadUrl || 
        validDownload.link;

      const videoTitle = 
        validDownload.title || 
        validDownload.filename || 
        'Downloaded Video';

      // Send video attachment
      await sendMessage(
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

      // Optional metadata
      if (validDownload.duration || validDownload.size) {
        await sendMessage(
          senderId, 
          { 
            text: `📊 Video Details:\n` +
                  `Title: ${videoTitle}\n` +
                  `${validDownload.duration ? `Duration: ${validDownload.duration}\n` : ''}` +
                  `${validDownload.size ? `Size: ${validDownload.size}` : ''}`
          }, 
          pageAccessToken
        );
      }

    } catch (error) {
      console.error('Detailed Download Error:', error);

      // Comprehensive error handling
      const errorMessage = 
        error.response 
          ? `Server Error (${error.response.status}): ${error.response.data?.message || 'Unknown error'}` :
        error.request 
          ? 'No response from server. The service might be temporarily unavailable.' :
        error.message 
          ? `Request Error: ${error.message}` :
        'An unexpected error occurred';

      await sendMessage(
        senderId, 
        { 
          text: `❌ Download Failed\n${errorMessage}\n\nPlease check:\n- URL validity\n- Platform support\n- Service availability` 
        }, 
        pageAccessToken
      );
    }
  }
};
