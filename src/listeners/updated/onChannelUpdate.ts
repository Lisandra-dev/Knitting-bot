import { ChannelType, Client, Snowflake, TextChannel } from "discord.js";
import { CommandName, get } from "../../maps";
import { addRoleAndUserToThread, checkIfThreadIsIgnored, logInDev } from "../../utils";

/**
 * @param {Client} client - Discord.js Client
 * @returns {void}
 * @description This is a listener for channel update event.
 * When the permission of a channel is updated, check if the channel have thread and update them.
 */

export default (client: Client): void => {
	client.on("channelUpdate", async (
		oldChannel,
		newChannel) => {
		if (get(CommandName.channel) === false) return;
		logInDev(`Channel #${getChannelName(oldChannel.id, client)} updated`);
		if (oldChannel.type !== ChannelType.GuildText
			|| newChannel.type !== ChannelType.GuildText
			|| oldChannel.permissionOverwrites.cache === newChannel.permissionOverwrites.cache) {
			logInDev("Channel is not a text channel or permission are not changed");
			return;
		}
		//get all threads of this channel
		logInDev(`Updating threads of ${newChannel.name}`);
		const threads = await newChannel.threads.cache;
		threads.forEach(thread => {
			if (!get(CommandName.followOnlyChannel)) {
				if (!checkIfThreadIsIgnored(thread)) addRoleAndUserToThread(thread);
			} else {
				if (checkIfThreadIsIgnored(thread)) addRoleAndUserToThread(thread);
			}
		});
	});
};


/**
 * @description Get the name of a channel
 * @param channelID {Snowflake} - The ID of the channel
 * @param Client {Client} - The Discord.js Client
 */
function getChannelName(channelID: Snowflake, Client: Client) {
	const channel = Client.channels.cache.get(channelID);
	//check if the channel is a text channel
	if (!channel || channel.type !== ChannelType.GuildText) return channelID;
	return (channel as TextChannel).name;
}