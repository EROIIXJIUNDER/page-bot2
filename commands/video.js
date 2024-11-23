const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const API_KEYS = [
  'b38444b5b7mshc6ce6bcd5c9e446p154fa1jsn7bbcfb025b3b',
  '719775e815msh65471c929a0203bp10fe44jsndcb70c04bc42',
  'a2743acb5amsh6ac9c5c61aada87p156ebcjsnd25f1ef87037',
  '8e938a48bdmshcf5ccdacbd62b60p1bffa7jsn23b2515c852d',
  'f9649271b8mshae610e65f24780cp1fff43jsn808620779631',
  '8e906ff706msh33ffb3d489a561ap108b70jsne55d8d497698',
  '4bd76967f9msh2ba46c8cf871b4ep1eab38jsn19c9067a90bb',
];

// Function to get a random API key from the list
const getRandomApiKey = () => {
  const randomIndex = Math.floor(Math.random() * API_KEYS.length);
  return API_KEYS[randomIndex];
};

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
      const downloadResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${videoId}&apikey=${getRandomApiKey()}`);
      const videoUrl = downloadResponse.data[0];

      if (!videoUrl) {
        sendMessage(senderId, { text: 'Sorry, failed to retrieve the video.' }, pageAccessToken);
        return;
      }

      // Check if video URL is downloadable and not too large
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
