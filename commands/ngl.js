const axios = require('axios');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'nglspam',
  description: 'Send spam messages to an NGL username.',
  author: 'Clarence',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 3) {
      sendMessage(senderId, { text: 'Usage: nglspam <username> <amount> <message>' }, pageAccessToken);
      return;
    }

    const [username, amount, ...messageParts] = args;
    const message = messageParts.join(' ');

    if (isNaN(amount)) {
      sendMessage(senderId, { text: 'Amount must be a number.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://clarence-rest-apiv1.onrender.com/api/nglspam?username=${encodeURIComponent(username)}&amount=${amount}&message=${encodeURIComponent(message)}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        sendMessage(
          senderId,
          {
            text: `Spam Successful!\n\n${response.data.message}`,
          },
          pageAccessToken
        );
      } else {
        sendMessage(
          senderId,
          {
            text: 'Failed to send spam. Please check the username or try again later.',
          },
          pageAccessToken
        );
      }
    } catch (error) {
      console.error('Error executing NGL spam:', error);
      sendMessage(senderId, { text: 'An error occurred while processing your request.' }, pageAccessToken);
    }
  },
};
