const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("../handles/sendMessage");

const usernames = [
  "yskbvxz", "icyw3ird_", "prayaimcrestha", "lets.archive.together", "feelanshul",
  "meouw_01", "hearthub.us", "deadchuckie", "primis_chacha", "theycallme_sandipeyyy",
  "abiralshresthaa", "anup.10_", "manthan_khatri2205", "washbish65"
];

const autoSendStatus = {};
const autoSendIntervals = {};
const paginationTokens = [];

module.exports = {
  name: "reelss",
  description: "Get status video from Instagram user",
  usage: "reelss on | off",
  author: "Asmit Adk",

  async execute(senderId, args, pageAccessToken) {
    const threadID = senderId;

    if (args[0] === "on") {
      autoSendStatus[threadID] = true;
      await sendMessage(threadID, { text: "Auto-send is now ON ." }, pageAccessToken);
      startAutoSend({ senderId, pageAccessToken });
    } else if (args[0] === "off") {
      autoSendStatus[threadID] = false;
      clearInterval(autoSendIntervals[threadID]);
      await sendMessage(threadID, { text: "Auto-send is now OFF." }, pageAccessToken);
    } else {
      await sendReel({ senderId, pageAccessToken });
    }
  }
};

async function sendReel({ senderId, pageAccessToken }) {
  try {
    let username, token, apiUrl;

    // Selecting a random username
    username = usernames[Math.floor(Math.random() * usernames.length)];
    if (paginationTokens.length > 0) {
      token = paginationTokens[Math.floor(Math.random() * paginationTokens.length)];
      apiUrl = `https://insta-scrapper-kappa.vercel.app/kshitiz?username=${username}&token=${token}`;
    } else {
      apiUrl = `https://insta-scrapper-kappa.vercel.app/kshitiz?username=${username}`;
    }

    // Fetching the video URL
    const apiResponse = await axios.get(apiUrl);
    const videoURL = apiResponse.data.videoURL;
    if (!videoURL) throw new Error("No video URL found");

    const videoResponse = await axios.get(videoURL, { responseType: "stream" });
    const tempVideoPath = path.join(__dirname, "cache", `insta_video_${Date.now()}.mp4`);

    // Saving the video to disk
    const writer = fs.createWriteStream(tempVideoPath);
    videoResponse.data.pipe(writer);

    // Wait until the file is fully written
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Sending the video as an attachment
    const videoStream = fs.createReadStream(tempVideoPath);
    await sendMessage(senderId, { text: "", attachment: videoStream }, pageAccessToken);

    // Delete the video after sending
    fs.unlink(tempVideoPath, (err) => {
      if (err) console.error("Error deleting temp video:", err);
    });
  } catch (error) {
    console.error("Error fetching reel:", error.message || error);
    await sendMessage(senderId, { text: "Sorry, an error occurred while fetching the reel." }, pageAccessToken);
  }
}

function startAutoSend({ senderId, pageAccessToken }) {
  autoSendIntervals[senderId] = setInterval(() => {
    if (autoSendStatus[senderId]) {
      sendReel({ senderId, pageAccessToken });
    }
  }, 60000); // Auto-send every 60 seconds
}
