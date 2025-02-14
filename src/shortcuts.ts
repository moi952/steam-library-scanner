import fs from "fs-extra";
import * as path from "path";
import { readVdf } from "steam-binary-vdf";
import { SteamGame } from "./type/SteamGame";
import { log, error } from "./utils/logger";
import { normalizePath } from "./utils/pathUtils";

/**
 * Gets non-Steam games (shortcuts) from the shortcuts.vdf file.
 * @param steamPath Steam installation path.
 * @param userId Steam ID (used to build the path to shortcuts.vdf).
 * @returns An array of SteamGame for non-Steam shortcuts.
 */
export const getNonSteamGames = async (steamPath: string, userId: string): Promise<SteamGame[]> => {
	const userDataPath = path.join(
		normalizePath(steamPath),
		"userdata",
		userId,
		"config",
		"shortcuts.vdf",
	);
	const nonSteamGames: SteamGame[] = [];

	log("User data path:", userDataPath);

	if (fs.existsSync(userDataPath)) {
		log("Shortcuts.vdf file found at:", userDataPath);

		try {
			const shortcutsData = await fs.readFile(userDataPath);
			log("Contents of the .vdf buffer :", shortcutsData);

			const parsedData = readVdf(shortcutsData);
			log("Parsed shortcuts:", parsedData);

			if (parsedData && parsedData.shortcuts && typeof parsedData.shortcuts === "object") {
				const shortcuts = parsedData.shortcuts as { [key: string]: any };
				for (const key in shortcuts) {
					if (Object.prototype.hasOwnProperty.call(shortcuts, key)) {
						const shortcutInfo = shortcuts[key];

						const game: SteamGame = {
							appId: key,
							id: key,
							name: shortcutInfo.AppName || `Non-Steam Game ${key}`,
							cmd: shortcutInfo.Exe ? `file://${shortcutInfo.Exe}` : "steam://run/unknown",
							imagePath: shortcutInfo.icon || "",
							exe: shortcutInfo.Exe,
							startDir: shortcutInfo.StartDir,
							shortcutPath: shortcutInfo.ShortcutPath,
							launchOptions: shortcutInfo.LaunchOptions,
							hidden: shortcutInfo.hidden
								? shortcutInfo.hidden === "1" || shortcutInfo.hidden === "true"
								: shortcutInfo.IsHidden
									? shortcutInfo.IsHidden === "1" || shortcutInfo.IsHidden === "true"
									: false,
							tags: shortcutInfo.tags
								? Array.isArray(shortcutInfo.tags)
									? shortcutInfo.tags
									: Object.values(shortcutInfo.tags)
								: [],
							universe: undefined,
							stateFlags: undefined,
							installdir: undefined,
							lastUpdated: undefined,
							sizeOnDisk: undefined,
							buildid: undefined,
							lastPlayed: undefined,
						};

						nonSteamGames.push(game);
					}
				}
			} else {
				error("No shortcuts found in the shortcuts.vdf file (parsed data).");
			}
		} catch (err) {
			error("Error reading or parsing the shortcuts.vdf file:", err);
		}
	} else {
		error("Shortcuts.vdf file not found at:", userDataPath);
	}

	return nonSteamGames;
};
