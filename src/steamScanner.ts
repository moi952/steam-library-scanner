import * as fs from "fs";
import * as path from "path";
import { parseAcfFile } from "./acfParser";
import { getNonSteamGames } from "./shortcuts";
import { SteamGame } from "./type/SteamGame";
import { log, warn, error } from "./utils/logger";

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
