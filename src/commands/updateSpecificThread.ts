import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, ThreadChannel } from "discord.js";
import { addRoleAndUserToThread } from "../utils";

export default {
	data: new SlashCommandBuilder()
		.setName("update-specific-thread")
		.setDescription("Update a specific thread")
		.setDescriptionLocalizations({
			fr: "Met à jour un thread spécifique",
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addChannelOption(option => 
			option.setName("thread")
				.setDescription("Select the thread you want to update")
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const threadOption = interaction.options.get("thread");
		const channelId = threadOption?.channel?.name;
		await interaction.reply({ content: `Updating ${channelId}`, ephemeral: true });
		if (!interaction.guild) return;
		const thread = threadOption?.channel as ThreadChannel;
		if (!thread || !thread.isThread()) {
			await interaction.followUp("Please select a valid thread channel.");
			return;
		}
		await addRoleAndUserToThread(thread);
	}
};
