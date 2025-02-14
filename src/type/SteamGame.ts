// To avoid naming conflicts in this same file, we redefine the interface here too
export interface SteamGame {
	/**
	 * @deprecated Use `appId` instead.
	 */
	id?: string;
	appId: string;
	name: string;
	cmd: string;
	imagePath: string;

	// Steam game-specific fields (appmanifest)
	universe?: string;
	stateFlags?: string;
	installdir?: string;
	lastUpdated?: string;
	sizeOnDisk?: string;
	buildid?: string;
	lastPlayed?: string;

	// Non-Steam game-specific fields (shortcuts)
	exe?: string;
	startDir?: string;
	shortcutPath?: string;
	launchOptions?: string;
	hidden?: boolean;
	tags?: string[];
}
