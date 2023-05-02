import { Client, GatewayIntentBits, Partials } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";
import interactionCreate from "./listeners/interactionCreate";
import onBotEnter from "./listeners/onBotEnter";
import ready from "./listeners/ready";
import memberUpdate from "./listeners/memberUpdate";
import onThreadCreated from "./listeners/onThreadCreated";
import onChannelUpdate from "./listeners/onChannelUpdate";
import onNewMember from "./listeners/onNewMember";
import { commands } from "./commands";
import { get } from "./maps";
import { logInDev } from "./utils";
import { ressources } from "./i18n/i18next";
import i18next from "i18next";

dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Channel],
});


const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN ?? "0");

(async () => {
	try {
		logInDev("Started refreshing application (/) commands.");
		for (const guild of client.guilds.cache.values()) {
			for (const command of commands) {
				await rest.put(
					Routes.applicationGuildCommands(process.env.CLIENT_ID ?? "0", guild.id),
					{ body: command },
				);
				logInDev(`Slash ${command.data.name} registered for ${guild.name}`);
			}
		}
		logInDev("Successfully reloaded slash commands.");
	} catch (error) {
		console.error(error);
	}
})();

try {
	ready(client);
	memberUpdate(client);
	onThreadCreated(client);
	onChannelUpdate(client);
	onNewMember(client);
	onBotEnter(client);
	interactionCreate(client);
} catch (error) {
	console.error(error);
}
client.login(process.env.DISCORD_TOKEN);

