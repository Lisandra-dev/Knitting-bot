import Enmap from "enmap";
import { logInDev } from "./utils";

export const optionMaps = new Enmap({name: "Configuration"});
export const translationLanguage = optionMaps.get("language") || "en";

export enum CommandName {
	language = "language",
	member = "onMemberUpdate",
	thread = "onThreadCreated",
	channel = "onChannelUpdate",
	newMember = "onNewMember",
}

/**
 * Set a value in Emaps "configuration"
 * @param {commandName} name
 * @param {string | boolean} value
 */
export function set(name: CommandName, value: string | boolean) {
	optionMaps.set(name, value);
	logInDev(`Set ${name} to ${value}`);
}


/**
 * Get a value in the Emaps "configuration"
 * Return "en" if CommandName.language is not set
 * return true if value is not set (for the other options)
 * @param {CommandName} name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get(name: CommandName):any {
	if (name === CommandName.language) {
		return optionMaps.get(name) || "en";
	}
	return optionMaps.get(name) ?? true;
}

/**
 * Set default value in Emaps "configuration"
 */
export function setDefaultValue() {
	if (!optionMaps.has("language")) {
		set(CommandName.language, "en");
		logInDev("Set default language to en");
	}
	if (!optionMaps.has("onChannelUpdate")) {
		set(CommandName.channel, true);
		logInDev("Set default onChannelUpdate to true");
	}
	if (!optionMaps.has("onMemberUpdate")) {
		set(CommandName.member, true);
		logInDev("Set default onMemberUpdate to true");
	}
	if (!optionMaps.has("onNewMember")) {
		set(CommandName.newMember, true);
		logInDev("Set default onNewMember to true");
	}
	if (!optionMaps.has("onThreadCreated")) {
		set(CommandName.thread, true);
		logInDev("Set default onThreadCreated to true");
	}
}

