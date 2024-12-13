const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'help',
  description: 'Show available commands with descriptions',
  role: 1,
  author: 'kiana',
  
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../cmds');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

   
    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `✨ ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}`,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commands.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

 
    if (isNaN(page) || page < 1) page = 1;

    // Display all commands if "help all" is provided
    if (args[0]?.toLowerCase() === 'all') {
      const helpTextMessage = `🌟 **All Available Commands**\n📜 **Total Commands**: ${totalCommands}\n\n${commands.map((cmd, index) => `${index + 1}. ${cmd.title}\n📖 ${cmd.description}`).join('\n\n')}`;
      return sendMessage(senderId, { text: helpTextMessage }, pageAccessToken);
    }


    const startIndex = (page - 1) * commandsPerPage;
    const commandsForPage = commands.slice(startIndex, startIndex + commandsPerPage);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `❌ Oops! Page ${page} doesn't exist. There are only ${totalPages} page(s) available.`,
      }, pageAccessToken);
    }

    const helpTextMessage = `🚀 **Commands List** (Page ${page}/${totalPages})\n📜 **Total Commands**: ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `${startIndex + index + 1}. ${cmd.title}\n📝 ${cmd.description}`).join('\n\n')}\n\n📌 **Tip**: Use "help [page]" to switch pages, or "help all" to see all commands!`;


    const quickReplies = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title.replace('✨ ', ''),
      payload: cmd.payload
    }));


    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};
