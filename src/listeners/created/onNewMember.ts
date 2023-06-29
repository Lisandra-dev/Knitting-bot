import { Client, ThreadChannel } from "discord.js";
import {get } from "../../maps";
import { CommandName } from "../../interface";
import {
	addUserToThread,
	checkIfMemberRoleIsFollowed, checkIfTheadIsFollowed,
	checkIfThreadIsIgnored,
	checkMemberRoleNotIgnored,
	logInDev,
} from "../../utils";

/**
 * @param {Client} client - Discord.js Client
 * @returns {void}
 * @description This is a listener for new member event, add them to thread they can see
 */

export default (client: Client): void => {
	client.on("guildMemberAdd", async (member) => {
		if (get(CommandName.newMember) === false) return;
		if (member.user.bot) return;
		logInDev(`${member.user.username} joined the server`);
		const guild = member.guild;
		const channels = guild.channels.cache.filter(channel => channel.isThread());
		for (const channel of channels.values()) {
			const threadChannel = channel as ThreadChannel;
			const roleIsAllowed = !checkIfMemberRoleIsFollowed(member.roles) && !checkMemberRoleNotIgnored(member.roles);
			if (!get(CommandName.followOnlyChannel)) {
				if (!checkIfThreadIsIgnored(threadChannel) && roleIsAllowed) await addUserToThread(threadChannel, member);
			} else {
				if (roleIsAllowed && checkIfTheadIsFollowed(threadChannel)) await addUserToThread(threadChannel, member);
			}
		}
		
	});
};
