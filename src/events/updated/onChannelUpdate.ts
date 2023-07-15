import { ChannelType, Client, Snowflake, TextChannel } from "discord.js";
import { CommandName } from "../../interface";
import { getConfig } from "../../maps";
import { discordLogs, logInDev } from "../../utils";
import { addRoleAndUserToThread } from "../../utils/add";
import { checkThread, validateChannelType } from "../../utils/data_check";

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
		if (oldChannel.type === ChannelType.DM || newChannel.type === ChannelType.DM || !oldChannel.guild) return;
		const guild = oldChannel.guild.id;
		if (getConfig(CommandName.channel, guild) === false) return;
		logInDev(`Channel #${getChannelName(oldChannel.id, client)} updated\n. Channel type:`, oldChannel.type, newChannel.type);
		if (!validateChannelType(oldChannel)
			|| !validateChannelType(newChannel)
			|| oldChannel.permissionOverwrites.cache === newChannel.permissionOverwrites.cache) {
			logInDev("Channel is not a text channel or permission are not changed");
			return;
		}
		//getConfig all threads of this channel
		const isCategory = newChannel.type === ChannelType.GuildCategory;
		if (isCategory) {
			//get all threads of the channels in the category
			const children = newChannel.children.cache;
			if (children.size === 0) return;
			children.forEach(child => {
				if (child.type === ChannelType.GuildText) {
					const threads = (child as TextChannel).threads.cache;
					if (threads.size > 0) discordLogs(guild, client, `Updating ${threads.size} thread of ${child.name}`);
					threads.forEach(thread => {
						if (!getConfig(CommandName.followOnlyChannel, guild)) {
							if (!checkThread(thread, "ignore")) addRoleAndUserToThread(thread);
						} else {
							if (checkThread(thread, "follow")) addRoleAndUserToThread(thread);
						}
					});
				}
			});
		} else {
			const newTextChannel = newChannel as TextChannel;
			const threads = newTextChannel.threads.cache;
			logInDev(`Updating ${threads.size} channels of ${newChannel.name}`);
			if (threads.size === 0) return;
			await discordLogs(guild, client, `Updating ${threads.size} threads of ${newChannel.name}`);
			threads.forEach(thread => {
				if (!getConfig(CommandName.followOnlyChannel, guild)) {
					if (!checkThread(thread, "ignore")) addRoleAndUserToThread(thread);
				} else {
					if (checkThread(thread, "follow")) addRoleAndUserToThread(thread);
				}
			});
		}
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
