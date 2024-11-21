const tinyurl = require('tinyurl');
const { sendMessage } = require('../handles/sendMessage'); // Assuming this utility is used for message sending.

module.exports = {
  name: 'tinyurl',
  description: 'Shorten URLs using TinyURL',
  usage: 'tinyurl [URL]',
  author: 'asmit',
  async execute(senderId, args, pageAccessToken) {
    // Ensure there is an argument (URL) provided.
    const url = args.join(' ');
    if (!url) {
      return sendMessage(senderId, { text: '❌ | Please provide a valid URL to shorten.' }, pageAccessToken);
    }

    try {
      // Check if the URL is valid by trying to shorten it.
      const shortUrl = await tinyurl.shorten(url);
      sendMessage(senderId, { text: `✅ | Here is your shortened URL: ${shortUrl}` }, pageAccessToken);
    } catch (error) {
      // Handle any errors (invalid URL, TinyURL service issues, etc.)
      sendMessage(senderId, { text: '❌ | An error occurred while shortening the URL. Try again later.' }, pageAccessToken);
      console.error('TinyURL error:', error);
    }
  }
};
