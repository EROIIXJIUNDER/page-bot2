const axios = require('axios');
const { sendMessage } = require('../handles/message'); // Ensure the path is correct

module.exports = {
  name: 'chords',
  description: 'Fetch song chords',
  author: 'Deku (rest api)',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');
    try {
      const apiUrl = `https://markdevs-last-api-2epw.onrender.com/search/chords?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const result = response.data.chord;

      if (result && result.chords) {
        const chordsMessage = `Title: ${result.title}\nArtist: ${result.artist}\nKey: ${result.key}\n\n${result.chords}`;

        
        await sendResponseInChunks(senderId, chordsMessage, pageAccessToken);

        
        if (result.url) {
          await sendMessage(senderId, { text: `You can also view the chords here: ${result.url}` }, pageAccessToken);
        }
      } else {
        console.error('Error: No chords found in the response.');
        await sendMessage(senderId, { text: 'Sorry, no chords were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Chords API:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};


async function sendResponseInChunks(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}


function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let chunk = '';
  const words = message.split(' ');

  for (const word of words) {
    if ((chunk + word).length > chunkSize) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += `${word} `;
  }

  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}
