const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
	name: "uid",
	version: "1.3",
	author: "Asmit",
	description: "View Facebook user id of a user",

	async execute(senderId, args, event, pageAccessToken) {
		// Respond with sender's own ID if no argument is provided
		if (!args[0]) {
			return sendMessage(senderId, { text: event.senderID }, pageAccessToken);
		}

		// Check if the argument is a URL to find UID from profile link
		if (args[0].match(regExCheckURL)) {
			let msg = '';
			for (const link of args) {
				try {
					const uid = await findUid(link);
					msg += `${link} => ${uid}\n`;
				} catch (e) {
					msg += `${link} (ERROR) => ${e.message}\n`;
				}
			}
			return sendMessage(senderId, { text: msg }, pageAccessToken);
		}

		// Respond with UIDs of tagged users
		let msg = '';
		const { mentions } = event;
		for (const id in mentions) {
			msg += `${mentions[id].replace("@", "")}: ${id}\n`;
		}
		sendMessage(senderId, { text: msg || "Please tag a person or provide a profile link." }, pageAccessToken);
	}
};
