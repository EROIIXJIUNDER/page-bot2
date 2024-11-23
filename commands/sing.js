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

// Helper to get a random API key from the list
const getRandomApiKey = () => {
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    return API_KEYS[randomIndex];
};

// Function to handle the song search and sending to the user
async function sing(senderId, args, pageAccessToken) {
    try {
        let title = '';
        let videoId = '';
        let videoUrl = '';

        // If no args are provided, ask the user to provide a song name
        if (args.length === 0) {
            sendMessage(senderId, { text: 'Please provide a song name to search.' }, pageAccessToken);
            return;
        }

        title = args.join(" ");

        // Searching for the song on YouTube
        const searchResponse = await axios.get(`https://youtube-kshitiz-gamma.vercel.app/yt?search=${encodeURIComponent(title)}`);
        if (searchResponse.data.length > 0) {
            videoId = searchResponse.data[0].videoId;
        }

        if (!videoId) {
            sendMessage(senderId, { text: 'No song found for the given query.' }, pageAccessToken);
            return;
        }

        // Get the song download link using the video ID
        const videoUrlResponse = await axios.get(`https://yt-kshitiz.vercel.app/download?id=${encodeURIComponent(videoId)}&apikey=${getRandomApiKey()}`);
        if (videoUrlResponse.data.length > 0) {
            videoUrl = videoUrlResponse.data[0];
        }

        if (!videoUrl) {
            sendMessage(senderId, { text: 'Failed to retrieve download link for the song.' }, pageAccessToken);
            return;
        }

        // If the song size is greater than 25MB, send a download link
        const videoStreamResponse = await axios.head(videoUrl); // HEAD request to check file size
        const fileSize = parseInt(videoStreamResponse.headers['content-length'], 10);

        if (fileSize > 25 * 1024 * 1024) { // If the file size exceeds 25MB, send a download link
            sendMessage(
                senderId,
                {
                    text: `🎶 The song is too large to send directly. You can download it here: ${videoUrl}`
                },
                pageAccessToken
            );
        } else {
            // Otherwise, send the song as an attachment
            sendMessage(
                senderId,
                {
                    attachment: {
                        type: 'audio',
                        payload: {
                            url: videoUrl,
                            is_reusable: true
                        }
                    }
                },
                pageAccessToken
            );
        }
    } catch (error) {
        console.error('Error:', error.message);
        sendMessage(senderId, { text: 'Sorry, there was an error processing your request. Please try again later.' }, pageAccessToken);
    }
}

module.exports = {
    name: 'sing',
    description: 'Search and play songs from YouTube.',
    usage: 'sing [song name]',
    author: 'Asmit',

    async execute(senderId, args, pageAccessToken) {
        await sing(senderId, args, pageAccessToken);
    }
};
