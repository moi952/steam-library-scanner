import * as fs from "fs";
import * as path from "path";
import { parseAcfFile } from "./acfParser";
import { getNonSteamGames } from "./shortcuts";
import { SteamGame } from "./type/SteamGame";
import { log, warn, error } from "./utils/logger";
const vdf = require("simple-vdf");

/**
 * Retrieves installed Steam games by reading appmanifest_*.acf files.
 * @param steamPath Steam installation path.
 * @returns An array of SteamGame for installed Steam games.
 */
export const getSteamInstalledGames = (steamPath: string): SteamGame[] => {
  const steamConfigPath = path.join(steamPath, "steamapps");
  const files = fs.readdirSync(steamConfigPath);
  log("Scanning steamapps folder", files);

  const acfFiles = files.filter(
    (file) => file.startsWith("appmanifest_") && file.endsWith(".acf")
  );
  log("Manifest files found:", acfFiles);

  const steamGames: SteamGame[] = acfFiles
    .map((file) => {
      const filePath = path.join(steamConfigPath, file);
      log("Processing manifest file:", filePath);

      try {
        const gameData = fs.readFileSync(filePath, "utf-8");
        const gameInfo = parseAcfFile(gameData);

        if (!gameInfo.appid) {
          warn("Game ID not found in file:", file);
          return null;
        }

        const game: SteamGame = {
          id: gameInfo.appid,
          name: gameInfo.name || `Steam Game ${gameInfo.appid}`,
          cmd: `steam://run/${gameInfo.appid}`,
          imagePath: path.join(
            steamPath,
            "appcache",
            "librarycache",
            gameInfo.appid,
            "library_600x900.jpg"
          ),
          universe: gameInfo.Universe,
          stateFlags: gameInfo.StateFlags,
          installdir: gameInfo.installdir,
          lastUpdated: gameInfo.LastUpdated,
          sizeOnDisk: gameInfo.SizeOnDisk,
          buildid: gameInfo.buildid,
          lastPlayed: gameInfo.LastPlayed,
          exe: undefined,
          startDir: undefined,
          shortcutPath: undefined,
          launchOptions: undefined,
          hidden: undefined,
          tags: [],
        };
        log("Game parsed successfully:", game.name);
        return game;
      } catch (err) {
        error("Error reading or parsing file:", filePath, err);
        return null;
      }
    })
    .filter((game): game is SteamGame => game !== null);

  log("Total Steam games found:", steamGames.length);
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
  userId: string
): Promise<{
  steamGames: SteamGame[];
  nonSteamGames: SteamGame[];
  all: SteamGame[];
}> => {
  log("Retrieving all Steam games...");
  const steamGames = getSteamInstalledGames(steamPath);
  const nonSteamGames = await getNonSteamGames(steamPath, userId);
  const all = [...steamGames, ...nonSteamGames];
  log("Total games found:", all.length);

  return { steamGames, nonSteamGames, all };
};

/**
 * Method to retrieve Steam users.
 * @returns An array of objects containing the user ID and name.
 */
export const getSteamUsers = async (
  steamPath: string
): Promise<{ id: string; name: string }[]> => {
  const usersPath = path.join(steamPath, "userdata");
  const loginUsersPath = path.join(steamPath, "config", "loginusers.vdf");

  log(`Checking Steam users folder at: ${usersPath}`);

  if (fs.existsSync(usersPath) && fs.existsSync(loginUsersPath)) {
    const users = fs.readdirSync(usersPath);
    log(`Found ${users.length} Steam user folders.`);

    // Read the loginusers.vdf file as a string
    const loginUsersContent = fs.readFileSync(loginUsersPath, "utf-8");
    log(`Read loginusers.vdf file content.`);

    try {
      // Parse the VDF content using simple-vdf
      const parsedVdf = vdf.parse(loginUsersContent);
      log(`Successfully parsed VDF file.`, parsedVdf);

      const userData = parsedVdf.users || {};
      log("userData :", userData);

      if (!userData) {
        log(`No users found in the VDF file.`);
        return [];
      }

      // Map user IDs with their names
      const usersFound = users.map((userId) => {
        // Try to find a matching user in the VDF data
        const userInfo = Object.values(userData).find(
          (user: any) => (user as any).AccountName
        );
        return {
          id: userId,
          name:
            (userInfo as any)?.AccountName ||
            (userInfo as any)?.PersonaName ||
            "Unknown",
        };
      });

      log("Users found", usersFound);
      return usersFound;
    } catch (error: any) {
      log(`Error parsing VDF file: ${error.message}`);
      return [];
    }
  } else {
    log("No Steam users folder or loginusers.vdf file found.");
    return [];
  }
};
