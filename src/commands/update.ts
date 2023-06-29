import { channelMention } from "@discordjs/formatters";
import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	ThreadChannel,
} from "discord.js";
import { getConfig } from "../maps";
import { CommandName } from "../interface";
import { addRoleAndUserToThread, checkThread, checkIfThreadIsIgnored } from "../utils";
import { default as i18next } from "../i18n/i18next";
const fr = i18next.getFixedT("fr");
const en = i18next.getFixedT("en");

export default {
	data: new SlashCommandBuilder()
		.setName(en("commands.name"))
		.setNameLocalizations({
			fr: fr("commands.name"),
		})
		.setDescription(en("commands.description"))
		.setDescriptionLocalizations({
			fr: fr("commands.description"),
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("common.thread").toLowerCase())
				.setNameLocalizations({
					fr: fr("common.thread").toLowerCase(),
				})
				.setDescription(en("commands.updateSpecificThread.description"))
				.setDescriptionLocalizations({
					fr: fr("commands.updateSpecificThread.description"),
				})
				.addChannelOption((option) =>
					option
						.setName(en("common.thread").toLowerCase())
						.setNameLocalizations({
							fr: fr("common.thread").toLowerCase(),
						})
						.setDescription(
							en("commands.updateSpecificThread.option.description")
						)
						.setDescriptionLocalizations({
							fr: fr("commands.updateSpecificThread.option.description"),
						})
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("common.here"))
				.setNameLocalizations({
					fr: fr("common.here"),
				})
				.setDescription(en("commands.updateThread.description"))
				.setDescriptionLocalizations({
					fr: fr("commands.updateThread.description"),
				})
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("commands.updateAllThreads.name"))
				.setNameLocalizations({
					fr: fr("commands.updateAllThreads.name"),
				})
				.setDescription(en("commands.updateAllThreads.description"))
				.setDescriptionLocalizations({
					fr: fr("commands.updateAllThreads.description"),
				})
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("commands.help.name"))
				.setNameLocalizations({
					fr: fr("commands.help.name"),
				})
				.setDescription(en("commands.help.description"))
				.setDescriptionLocalizations({
					fr: fr("commands.help.description"),
				})		
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const commands = options.getSubcommand();
		switch (commands) {
		case en("commands.updateAllThreads.name"):
			await updateAllThreads(interaction);
			break;
		case en("common.here"):
			await updateThisThread(interaction);
			break;
		case en("common.thread").toLowerCase():
			await updateSpecificThread(interaction);
			break;
		case en("commands.help.name"):
			await displayHelp(interaction);
			break;
		default:
			await displayHelp(interaction);
		}
	},
};

async function updateAllThreads(interaction: CommandInteraction) {
	if (!interaction.guild) return;
	const threads = interaction.guild.channels.cache.filter((channel) =>
		channel.isThread()
	);
	await interaction.reply({
		content: i18next.t("commands.updateAllThreads.reply") as string,
		ephemeral: true,
	});
	const count = threads.size;
	for (const thread of threads.values()) {
		const threadChannel = thread as ThreadChannel;
		if (!getConfig(CommandName.followOnlyChannel)) {
			if (!checkIfThreadIsIgnored(threadChannel)) {
				await addRoleAndUserToThread(threadChannel);
			}
		}
		else {
			if (checkThread(threadChannel)) {
				await addRoleAndUserToThread(threadChannel);
			}
		}
	}
	await interaction.followUp({
		content: i18next.t("commands.updateAllThreads.success", {
			count: count,
		}) as string,
		ephemeral: true,
	});
}

async function updateThisThread(interaction: CommandInteraction) {
	if (!interaction.channel || !(interaction.channel instanceof ThreadChannel)) {
		await interaction.reply({
			content: i18next.t("commands.error") as string,
			ephemeral: true,
		});
		return;
	}
	const isFollowed = getConfig(CommandName.followOnlyChannel) && checkThread(interaction.channel);
	if (checkIfThreadIsIgnored(interaction.channel) || !isFollowed) {
		await interaction.reply({
			content: i18next.t("ignore.message", {thread: channelMention(interaction.channel.id)}) as string,
			ephemeral: true,
		});
		return;
	}
	try {
		await interaction.reply({
			content: `${
				i18next.t("commands.success", {
					channel: channelMention(interaction.channel.id),
				}) as string
			}`,
			ephemeral: true,
		});
		const thread = interaction.channel as ThreadChannel;
		await addRoleAndUserToThread(thread);
	} catch (e) {
		console.error(e);
		await interaction.reply({
			content: i18next.t("common.error", { error: e }) as string,
			ephemeral: true,
		});
	}
}

async function updateSpecificThread(interaction: CommandInteraction) {
	const threadOption = interaction.options.get(i18next.t("common.thread").toLowerCase() as string);
	const mention = threadOption?.channel ? channelMention(threadOption.channel.id) : "";
	if (!threadOption?.channel) {
		await interaction.reply({
			content: i18next.t("commands.error") as string,
			ephemeral: true,
		});
		return;
	}
	const isFollowed = getConfig(CommandName.followOnlyChannel) && checkThread(threadOption?.channel as ThreadChannel);
	if (checkIfThreadIsIgnored(threadOption?.channel as ThreadChannel) || !isFollowed) {
		await interaction.reply({
			content: i18next.t("ignore.message", {thread: mention}) as string,
			ephemeral: true,
		});
		return;
	}
	await interaction.reply({
		content: i18next.t("commands.success", { channel: mention }) as string,
		ephemeral: true,
	});
	if (!interaction.guild) return;
	const thread = threadOption?.channel as ThreadChannel;
	if (!thread || !thread.isThread()) {
		await interaction.followUp({
			content: i18next.t("commands.error") as string,
			ephemeral: true,
		});
		return;
	}
	await addRoleAndUserToThread(thread);
}

async function displayHelp(interaction: CommandInteraction) {
	const constructDesc: string = ((((((i18next.t(
		"commands.help.desc"
	) as string) + i18next.t("commands.help.all")) as string) +
		i18next.t("commands.help.here")) as string) +
		i18next.t("commands.help.thread")) as string;
	const embed = new EmbedBuilder()
		.setTitle(i18next.t("commands.help.title") as string)
		.setDescription(constructDesc)
		.setColor("#53dcaa");
	await interaction.reply({ embeds: [embed], ephemeral: true });
}

