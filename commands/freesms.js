const axios = require('axios');
const { sendMessage } = require('../handles/message');
const userLimits = {}; 

module.exports = {
  name: 'freesms',
  description: 'Send free SMS via LBC Express API',
  author: 'Clarence',
  role: 1, 
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 2) {
      sendMessage(senderId, { text: 'Usage: freesms <phone_number> <message>' }, pageAccessToken);
      return;
    }

    const [phoneNumber, ...messageParts] = args;
    const message = messageParts.join(' ');

    
    const now = Date.now();
    const limit = 5; 
    const windowMs = 3600000; // 

    if (!userLimits[senderId]) userLimits[senderId] = [];
    userLimits[senderId] = userLimits[senderId].filter((timestamp) => now - timestamp < windowMs);

    if (userLimits[senderId].length >= limit) {
      sendMessage(
        senderId,
        { text: '❌ Rate limit exceeded. You can send up to 5 SMS messages per hour.' },
        pageAccessToken
      );
      return;
    }

    userLimits[senderId].push(now);

    try {
      const apiUrl = `https://api.kenliejugarap.com/freesmslbc/?number=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`;
      const response = await axios.get(apiUrl);

      if (response.data.status) {
        sendMessage(
          senderId,
          {
            text: `✅ SMS Sent Successfully!\n\n- **To**: ${phoneNumber}\n- **Message**: ${message}\n- **Response**: ${response.data.response}\n- **Network**: ${response.data.sim_network}\n- **Message Parts**: ${response.data.message_parts}\n- **Remaining Messages**: ${Math.floor(response.data.message_remaining)}\n\n**Promotion**: ${response.data.promotion}`,
          },
          pageAccessToken
        );
      } else {
        sendMessage(senderId, { text: '❌ Failed to send SMS. Please check the phone number or try again later.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      sendMessage(senderId, { text: 'An error occurred while processing your request. Please try again later.' }, pageAccessToken);
    }
  },
};
