import { roleMention } from "@discordjs/formatters";
import {
	CategoryChannel,
	CommandInteraction,
	CommandInteractionOptionResolver,
	EmbedBuilder, ForumChannel,
	PermissionFlagsBits,
	Role, SlashCommandBuilder,
	TextChannel,
	ThreadChannel,
} from "discord.js";
import { default as i18next } from "../i18n/i18next";
import { CommandName, get, getFollow, setFollow, TypeName } from "../maps";
import { logInDev } from "../utils";

const fr = i18next.getFixedT("fr");
const en = i18next.getFixedT("en");


export default {
	data: new SlashCommandBuilder()
		.setName("follow")
		.setDescription(en("follow.description"))
		.setDescriptionLocalizations({
			fr: fr("follow.description"),
		})
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("common.channel").toLowerCase())
				.setNameLocalizations({
					fr: fr("common.channel").toLowerCase(),
				})
				.setDescription(en("follow.thread.description"))
				.setDescriptionLocalizations({
					fr: fr("follow.thread.description"),
				})
				.addChannelOption((option) =>
					option
						.setName(en("common.channel").toLowerCase())
						.setNameLocalizations({
							fr: fr("common.channel").toLowerCase(),
						})
						.setDescription(
							en("follow.thread.option.description")
						)
						.setDescriptionLocalizations({
							fr: fr("follow.thread.option.description"),
						})
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("common.role").toLowerCase())
				.setNameLocalizations({
					fr: fr("common.role").toLowerCase(),
				})
				.setDescription(en("follow.role.description"))
				.setDescriptionLocalizations({
					fr: fr("follow.role.description"),
				})
				.addRoleOption((option) =>
					option
						.setName(en("common.role").toLowerCase())
						.setNameLocalizations({
							fr: fr("common.role").toLowerCase(),
						})
						.setDescription(en("follow.role.option"))
						.setDescriptionLocalizations({
							fr: fr("follow.role.option"),
						})
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(en("common.list"))
				.setNameLocalizations({
					fr: fr("common.list"),
				})
				.setDescription(en("follow.list.description"))
				.setDescriptionLocalizations({
					fr: fr("follow.list.description"),
				})
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.guild) return;
		const options = interaction.options as CommandInteractionOptionResolver;
		const commands = options.getSubcommand();
		logInDev("follow", commands);
		switch (commands) {
		case (en("common.channel").toLowerCase()):
			if (!get(CommandName.followOnlyChannel)) {
				await interaction.reply({
					content: i18next.t("follow.disabled") as string,
					ephemeral: true,
				});
				return;
			}
			await followText(interaction);
			break;
		case (en("common.role").toLowerCase()):
			if (!get(CommandName.followOnlyRole)) {
				await interaction.reply({
					content: i18next.t("follow.disabled") as string,
					ephemeral: true,
				});
				return;
			}
			await followThisRole(interaction);
			break;
		case "list":
			await displayFollowed(interaction);
			break;
		default:
			await displayFollowed(interaction);
			break;
			
		}
	}
};

async function displayFollowed(interaction: CommandInteraction) {
	const followedCategories = getFollow(TypeName.category) as CategoryChannel[] ?? [];
	const followedThreads = getFollow(TypeName.thread) as ThreadChannel[] ?? [];
	const followedChannels = getFollow(TypeName.channel) as TextChannel[] ?? [];
	const followedForum = getFollow(TypeName.forum) as ForumChannel[] ?? [];
	const followedRoles = getFollow(TypeName.role) as Role[] ?? [];
	const followedCategoriesNames = "\n- " + followedCategories.map((category) => category.name).join("\n- ");
	const followedThreadsNames = "\n- " + followedThreads.map((thread) => thread.name).join("\n-");
	const followedChannelsNames = "\n- " + followedChannels.map((channel) => channel.name).join("\n-");
	const followedRolesNames = "\n- " + followedRoles.map((role) => role.name).join("\n-");
	const followedForumNames = "\n- " + followedForum.map((forum) => forum.name).join("\n-");
	const embed = new EmbedBuilder()
		.setColor("#2f8e7d")
		.setTitle(i18next.t("follow.list.title") as string)
		.addFields({
			name: i18next.t("common.category") as string,
			value: followedCategoriesNames || i18next.t("common.none") as string,
		})
		.addFields({
			name: i18next.t("common.channel") as string,
			value: followedThreadsNames || i18next.t("common.none") as string,
		})
		.addFields({
			name: i18next.t("common.channel") as string,
			value: followedChannelsNames || i18next.t("common.none") as string,
		})
		.addFields({
			name: i18next.t("common.forum") as string,
			value: followedForumNames || i18next.t("common.none") as string,
		})
		.addFields({
			name: i18next.t("common.role") as string,
			value: followedRolesNames || i18next.t("common.none") as string,
		});
	await interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
}

async function followThisRole(interaction: CommandInteraction) {
	const role = interaction.options.get(en("common.role").toLowerCase());
	logInDev("role", role);
	if (!role || !(role.role instanceof Role)) {
		await interaction.reply({
			content: i18next.t("ignore.role.error", {role: role}) as string,
			ephemeral: true,
		});
		return;
	}
	const followedRoles:Role[] = getFollow(TypeName.role) as Role[] ?? [];
	logInDev("allFollowRoles", followedRoles.map((role) => role.id));
	const isAlreadyFollowed = followedRoles.some(
		(followedRole: Role) => followedRole.id === role.role?.id
	);
	const mention = roleMention(role.role?.id ?? "");
	if (isAlreadyFollowed) {
		//remove from follow list
		const newFollowRoles: Role[] = followedRoles.filter(
			(followedRole: Role) => followedRole.id !== role.role?.id
		);
		setFollow(TypeName.role, newFollowRoles);
		await interaction.reply({
			content: i18next.t("follow.role.removed", {role: mention}) as string,
			ephemeral: true,
		});
	} else {
		//add to follow list
		followedRoles.push(role.role);
		setFollow(TypeName.role, followedRoles);
		await interaction.reply({
			content: i18next.t("follow.role.added", {role: mention}) as string,
			ephemeral: true,
		});
	}
}

async function followText(interaction: CommandInteraction) {
	const toIgnore = interaction.options.get(en("common.channel").toLowerCase()) ?? interaction;
	if (toIgnore.channel instanceof CategoryChannel) {
		await followThis(interaction, TypeName.category, toIgnore.channel);
	} else if (toIgnore?.channel && toIgnore.channel instanceof ThreadChannel) {
		await followThis(interaction, TypeName.thread, toIgnore.channel);
	} else if (toIgnore?.channel && toIgnore.channel instanceof TextChannel) {
		await followThis(interaction, TypeName.channel, toIgnore.channel);
	} else if (toIgnore?.channel && toIgnore.channel instanceof ForumChannel) {
		await followThis(interaction, TypeName.forum, toIgnore.channel);
	} else {
		await interaction.reply({
			content: i18next.t("ignore.error") as string,
			ephemeral: true,
		});
		return;
	}
}

async function followThis(
	interaction: CommandInteraction,
	typeName: TypeName,
	followChan?: CategoryChannel
		| ThreadChannel
		| TextChannel
		| ForumChannel) {
	if (!followChan) {
		await interaction.reply({
			content: i18next.t("commands.error") as string,
			ephemeral: true,
		});
		return;
	}
	let allFollowed: (ThreadChannel | CategoryChannel | TextChannel | ForumChannel)[] = [];
	switch (typeName) {
	case TypeName.category:
		allFollowed = getFollow(TypeName.category) as CategoryChannel[] ?? [];
		break;
	case TypeName.thread:
		allFollowed = getFollow(TypeName.thread) as ThreadChannel[] ?? [];
		break;
	case TypeName.channel:
		allFollowed = getFollow(TypeName.channel) as TextChannel[] ?? [];
		break;
	}
	const isAlreadyFollowed = allFollowed.some(
		(ignoredCategory: CategoryChannel | ForumChannel | ThreadChannel | TextChannel | Role ) => ignoredCategory.id === followChan?.id
	);
	if (isAlreadyFollowed) {
		//remove from ignore list
		const newFollowed = allFollowed.filter(
			(ignoredCategory: CategoryChannel | ForumChannel | ThreadChannel | TextChannel | Role) => ignoredCategory.id !== followChan?.id
		);
		setFollow(typeName, newFollowed);
		await interaction.reply({
			content: i18next.t("follow.thread.remove", {thread: followChan.name}) as string,
			ephemeral: true,
		});
	} else {
		//add to ignore list
		allFollowed.push(followChan);
		setFollow(typeName, allFollowed);
		await interaction.reply({
			content: i18next.t("follow.thread.success", {thread: followChan.name}) as string,
			ephemeral: true,
		});
	}
}
