import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { parseAcfFile } from "./acfParser";
import { getNonSteamGames } from "./shortcuts";
import { SteamGame } from "./type/SteamGame";
import { log, warn, error, info } from "./utils/logger";
import { normalizePath } from "./utils/pathUtils";
const vdf = require("simple-vdf");
import { readLocalConfigApps } from "./utils/vdfUtils";

/**
 * Formats the image path for a Steam game.
 * @param steamPath Steam installation path.
 * @param appId Steam game ID.
 * @returns The formatted image path.
 */
const formatImagePath = (steamPath: string, appId: string): string => {
	return path.join(steamPath, "appcache", "librarycache", appId, "library_600x900.jpg");
};

/**
 * Formats the Steam command URL for launching a game.
 *
 * On Windows, it uses "steam://run/<appId>".
 * On macOS and Linux, it uses "steam://rungameid/<appId>".
 *
 * @param appId - Steam game ID.
 * @returns The formatted Steam command URL.
 */
const formatSteamCmd = (appId: string): string => {
	if (os.platform() === "win32") return `steam://run/${appId}`;

	return `steam://rungameid/${appId}`;
};

/**
 * Retrieves installed Steam games by reading appmanifest_*.acf files.
 * @param steamPath Steam installation path.
 * @returns An array of SteamGame for installed Steam games.
 */
export const getSteamInstalledGames = async (
	steamPath: string,
	userId: string,
): Promise<SteamGame[]> => {
	userId = String(userId);
	const steamPathNormalized = normalizePath(steamPath);
	const steamConfigPath = path.join(steamPathNormalized, "steamapps");

	const localCfgApps = readLocalConfigApps(steamPathNormalized, userId);

	if (!fs.existsSync(steamConfigPath)) {
		warn(`The SteamApps folder does not exist: ${steamConfigPath}`);
		return [];
	}

	const files = fs.readdirSync(steamConfigPath);
	info("Scanning steamapps folder", files);

	const acfFiles = files.filter((file) => file.startsWith("appmanifest_") && file.endsWith(".acf"));
	info("Manifest files found:", acfFiles);

	const steamGames: SteamGame[] = acfFiles
		.map((file) => {
			const filePath = path.join(steamConfigPath, file);
			info("Processing manifest file:", filePath);

			try {
				const gameData = fs.readFileSync(filePath, "utf-8");
				const gameInfo = parseAcfFile(gameData);

				if (!gameInfo.appid) {
					warn("Game ID not found in file:", file);
					return null;
				}

				info("Game ID found:", gameInfo.appid);
				info("Config found:", localCfgApps[gameInfo.appid]);

				const game: SteamGame = {
					appId: gameInfo.appid,
					name: gameInfo.name || `Steam Game ${gameInfo.appid}`,
					cmd: formatSteamCmd(gameInfo.appid),
					imagePath: formatImagePath(steamPathNormalized, gameInfo.appid),
					universe: gameInfo.Universe,
					stateFlags: gameInfo.StateFlags,
					installdir: gameInfo.installdir,
					lastUpdated: gameInfo.LastUpdated,
					sizeOnDisk: gameInfo.SizeOnDisk,
					buildid: gameInfo.buildid,
					lastPlayed: localCfgApps[gameInfo.appid]?.LastPlayed || gameInfo.LastPlayed,
					exe: undefined, // TODO found with https://github.com/SteamDatabase/SteamAppInfo ?
					startDir: undefined, // TODO found with https://github.com/SteamDatabase/SteamAppInfo ?
					launchOptions: localCfgApps[gameInfo.appid]?.LaunchOptions,
					hidden: undefined, // info not found
					tags: [],
				};
				info("Game parsed successfully:", game.name);
				return game;
			} catch (err) {
				error("Error reading or parsing file:", filePath, err);
				return null;
			}
		})
		.filter((game): game is SteamGame => game !== null);

	info("Total Steam games found:", steamGames.length);
	return steamGames;
};

/**
 * Method to retrieve all Steam games.
 * @returns A promise that resolves to an object containing two arrays:
 * - steamGames: games installed via Steam (appmanifest)
 * - nonSteamGames: games added manually (shortcuts.vdf)
 * You can also retrieve a combined list via the all field.
 */
export const getAllSteamGames = async (
	steamPath: string,
	userId: string,
): Promise<{
	steamGames: SteamGame[];
	nonSteamGames: SteamGame[];
	all: SteamGame[];
}> => {
	userId = String(userId);
	log("Retrieving all Steam games...");
	const steamGames = await getSteamInstalledGames(steamPath, userId);
	const nonSteamGames = await getNonSteamGames(steamPath, userId);
	const all = [...steamGames, ...nonSteamGames];
	info("Total games found:", all.length);

	return { steamGames, nonSteamGames, all };
};

// Converts a numeric SteamID3 (string) to a SteamID64 string
const steamID3ToSteamID64 = (steamID3: string): string => {
	const accountId = BigInt(steamID3);
	const steamId64 = accountId + BigInt("76561197960265728");
	return steamId64.toString();
};

/**
 * Method to retrieve Steam users.
 * @returns An array of objects containing the user ID and name.
 */
export const getSteamUsers = async (
	steamPath: string,
): Promise<{ id: string; name: string; accountId: string; accountName: string }[]> => {
	const steamPathNormalized = normalizePath(steamPath);
	const usersPath = path.join(steamPathNormalized, "userdata");
	const loginUsersPath = path.join(steamPathNormalized, "config", "loginusers.vdf");

	log(`Checking Steam users folder at: ${usersPath}`);

	if (fs.existsSync(usersPath) && fs.existsSync(loginUsersPath)) {
		const userFolders = fs.readdirSync(usersPath);
		info(`Found ${userFolders.length} Steam user folders.`);

		const loginUsersContent = fs.readFileSync(loginUsersPath, "utf-8");
		info(`Read loginusers.vdf file content.`);

		try {
			const parsedVdf = vdf.parse(loginUsersContent);
			info(`Successfully parsed VDF file.`, parsedVdf);

			const userData = parsedVdf.users || {};
			info("userData :", userData);

			// For each user folder, we look for its info in loginusers.vdf
			const usersFound = userFolders.map((userId) => {
				const steamId64 = steamID3ToSteamID64(userId);
				const userInfo = userData[steamId64];
				return {
					id: userId,
					accountId: steamId64,
					name: userInfo?.PersonaName || userInfo?.AccountName || "Unknown",
					accountName: userInfo?.AccountName || "",
				};
			});

			info("Users found", usersFound);
			return usersFound;
		} catch (error: any) {
			error(`Error parsing VDF file: ${error.message}`);
			return [];
		}
	} else {
		warn("No Steam users folder or loginusers.vdf file found.");
		return [];
	}
};
