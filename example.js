import path from "path";
import os from "os";
import { getSteamUsers, getAllSteamGames } from "./dist/index.js";

(async () => {
	// Guess a default Steam path based on OS
	const steamPath = (() => {
		switch (os.platform()) {
			case "win32":
				return "C:\\Program Files (x86)\\Steam";
			case "darwin":
				return path.join(os.homedir(), "Library", "Application Support", "Steam");
			case "linux":
			default:
				return path.join(os.homedir(), ".steam", "steam");
		}
	})();

	console.log(`\nUsing Steam path: ${steamPath}\n`);

	// Fetch user IDs from the Steam install
	const users = await getSteamUsers(steamPath);

	if (!users.length) {
		console.error("❌ No Steam users found.");
		process.exit(1);
	}

	// Use the first user found
	const user = users[0];
	console.log(`→ Using user: ${user.name} (ID: ${user.id})\n`);

	// Fetch all games (Steam + non-Steam)
	const { steamGames, nonSteamGames, all } = await getAllSteamGames(steamPath, user.id);

	// Output results
	console.log(`✅ Found ${steamGames.length} installed Steam game(s):`);
	steamGames.forEach((game) => {
		console.log(`- [Steam] ${game.name} (${game.appId})`, game);
	});

	console.log(`\n✅ Found ${nonSteamGames.length} non-Steam game(s):`);
	nonSteamGames.forEach((game) => {
		console.log(`- [Shortcut] ${game.name}`, game);
	});

	console.log(`\n🎮 Total games: ${all.length}`);
})();
