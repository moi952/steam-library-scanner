import * as fs from "fs";
import fsExtra from "fs-extra";
import * as path from "path";
const vdf = require("simple-vdf");
import { log, warn } from "./logger";
import { readVdf } from "steam-binary-vdf";

export function readLocalConfigApps(steamPath: string, userId: string): Record<string, any> {
	const steamPathNormalized = path.normalize(steamPath);
	const localCfgPath = path.join(
		steamPathNormalized,
		"userdata",
		userId,
		"config",
		"localconfig.vdf",
	);
	log("Checking localconfig.vdf at:", localCfgPath);

	let localCfgApps: Record<string, any> = {};
	if (fs.existsSync(localCfgPath)) {
		log("localconfig.vdf found, reading...");
		try {
			const raw = fs.readFileSync(localCfgPath, "utf-8");
			const parsed = vdf.parse(raw);
			localCfgApps = parsed.UserLocalConfigStore?.Software?.Valve?.Steam?.apps || {};
		} catch (err) {
			warn(`Error reading localconfig.vdf: ${(err as Error).message}`);
		}
	} else {
		warn(`localconfig.vdf not found: ${localCfgPath}`);
	}

	return localCfgApps;
}

export const readAppInfo = async (steamPath: string): Promise<Record<string, any>> => {
	const steamPathNormalized = path.normalize(steamPath);
	const appinfoPath = path.join(steamPathNormalized, "appcache", "appinfo.vdf");
	log("Checking appinfo.vdf at:", appinfoPath);

	let appInfo: Record<string, any> = {};
	if (fs.existsSync(appinfoPath)) {
		log("appinfo.vdf found, reading...");
		try {
			const shortcutsData = await fsExtra.readFile(appinfoPath);
			const parsed = readVdf(shortcutsData);
			appInfo = parsed ?? {};
			log("Parsed appinfo.vdf:", appInfo);
		} catch (err) {
			warn(`Failed to parse appinfo.vdf: ${(err as Error).message}`);
		}
	} else {
		warn(`appinfo.vdf not found: ${appinfoPath}`);
	}
	return appInfo;
};
