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
  name: "reel",
  description: "Get status video from Instagram user",
  usage: "reelss on | off",
  author: "Asmit Adk",

  async execute(senderId, args, pageAccessToken) {
    const threadID = senderId;

    if (args[0] === "on") {
      autoSendStatus[threadID] = true;
      await sendMessage(threadID, { text: "Auto-send is now ON for this thread." }, pageAccessToken);
      startAutoSend({ senderId, pageAccessToken });
    } else if (args[0] === "off") {
      autoSendStatus[threadID] = false;
      clearInterval(autoSendIntervals[threadID]);
      await sendMessage(threadID, { text: "Auto-send is now OFF for this thread." }, pageAccessToken);
    } else {
      await sendReel({ senderId, pageAccessToken });
    }
  }
};

async function sendReel({ senderId, pageAccessToken }) {
  try {
    let username, token, apiUrl;

    if (paginationTokens.length > 0) {
      username = usernames[Math.floor(Math.random() * usernames.length)];
      token = paginationTokens[Math.floor(Math.random() * paginationTokens.length)];
      apiUrl = `https://insta-scrapper-kappa.vercel.app/kshitiz?username=${username}&token=${token}`;
    } else {
      username = usernames[Math.floor(Math.random() * usernames.length)];
      apiUrl = `https://insta-scrapper-kappa.vercel.app/kshitiz?username=${username}`;
    }

    const apiResponse = await axios.get(apiUrl);
    const videoURL = apiResponse.data.videoURL;
    const videoResponse = await axios.get(videoURL, { responseType: "stream" });

    const tempVideoPath = path.join(__dirname, "cache", `insta_video_${Date.now()}.mp4`);
    const writer = fs.createWriteStream(tempVideoPath);
    videoResponse.data.pipe(writer);

    writer.on("finish", async () => {
      const videoStream = fs.createReadStream(tempVideoPath);

      await sendMessage(senderId, { text: "", attachment: videoStream }, pageAccessToken);
      
      fs.unlink(tempVideoPath, () => {});
    });

    writer.on("error", async () => {
      await sendMessage(senderId, { text: "Error saving video. Please try again later." }, pageAccessToken);
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
  }, 60000);
        }
