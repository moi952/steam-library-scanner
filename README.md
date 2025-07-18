﻿# Steam Library Scanner

**Steam Library Scanner** is a library that helps you scan and retrieve information about your installed Steam games, non-Steam games, and Steam user accounts. It works by reading `appmanifest_*.acf` files for Steam games, the `shortcuts.vdf` file for non-Steam shortcuts, and the `loginusers.vdf` file to retrieve Steam users. This library can be used to collect information in a structured format.

## Features

- **Retrieve Installed Steam Games**: Scans the `steamapps` folder for `appmanifest_*.acf` files and extracts game data.
- **Retrieve Non-Steam Games**: Scans the `shortcuts.vdf` file in the user data folder to get non-Steam games added to Steam as shortcuts.
- **Combine Both Lists**: Get a combined list of both installed Steam games and non-Steam games.

## Installation

Install the package via npm:

```bash
npm install steam-library-scanner
```

## Usage

Below are examples demonstrating the usage of all three methods provided by the library.

### 1. Get Installed Steam Games

This function scans the `steamapps` directory in your Steam installation and returns an array of installed Steam games.

```ts
import { getSteamInstalledGames } from "steam-library-scanner";

// Path to your Steam installation directory
const steamPath = "C:\\Program Files (x86)\\Steam";
// Your Steam User ID (as found in the user data folder path)
const userId = "123456789";

const installedGames = getSteamInstalledGames(steamPath, userId);
console.log("Installed Steam Games:", installedGames);
```

### 2. Get Non-Steam Games

This asynchronous function retrieves non-Steam games (shortcuts) from the `shortcuts.vdf` file located in the user data folder. It requires both your Steam installation path and your Steam User ID.

```ts
import { getNonSteamGames } from "steam-library-scanner";

// Path to your Steam installation directory
const steamPath = "C:\\Program Files (x86)\\Steam";
// Your Steam User ID (as found in the user data folder path)
const userId = "123456789";

getNonSteamGames(steamPath, userId)
	.then((nonSteamGames) => {
		console.log("Non-Steam Games:", nonSteamGames);
	})
	.catch((error) => {
		console.error("Error retrieving non-Steam games:", error);
	});
```

### 3. Get All Steam Games (Installed + Non-Steam)

This asynchronous function returns an object containing both installed Steam games and non-Steam games, along with a combined list of all games.

```ts
import { getAllSteamGames } from "steam-library-scanner";

// Path to your Steam installation directory
const steamPath = "C:\\Program Files (x86)\\Steam";
// Your Steam User ID
const userId = "123456789";

getAllSteamGames(steamPath, userId)
	.then((games) => {
		console.log("Steam Games:", games.steamGames);
		console.log("Non-Steam Games:", games.nonSteamGames);
		console.log("All Games Combined:", games.all);
	})
	.catch((error) => {
		console.error("Error retrieving all games:", error);
	});
```

### 4. Get Steam Users

```ts
import { getSteamUsers } from "steam-library-scanner";

const steamPath = "C:\\Program Files (x86)\\Steam";

getSteamUsers(steamPath)
	.then((users) => {
		console.log("Steam Users:", users);
	})
	.catch((error) => {
		console.error("Error retrieving Steam users:", error);
	});
```

## Data Structure

Both installed Steam games and non-Steam games are returned as arrays of `SteamGame` objects, with the following properties:

- **id**: The game's unique ID (App ID for Steam games, ID for non-Steam games).
- **name**: The name of the game.
- **cmd**: The command to run the game (`steam://run/{appid}` for Steam games, file path for non-Steam games).
- **imagePath**: Path to the game’s cover art (only for Steam games).
- **exe**: Path to the executable for non-Steam games.
- **startDir**: The directory from which the non-Steam game should be launched.
- **shortcutPath**: The file path of the shortcut for non-Steam games.
- **launchOptions**: Launch options for all games.
- **hidden**: Indicates if the game is hidden in Steam’s library (for non-Steam games).
- **tags**: Tags associated with the game (for non-Steam games).
- **universe**: Steam game universe (only for Steam games).
- **stateFlags**: State flags of the Steam game (only for Steam games).
- **installdir**: Directory where the Steam game is installed (only for Steam games).
- **lastUpdated**: Last update timestamp of the Steam game (only for Steam games).
- **sizeOnDisk**: Size of the Steam game on disk (only for Steam games).
- **buildid**: Build ID of the Steam game (only for Steam games).
- **lastPlayed**: Last played timestamp (only for Steam games).

## Logging

The library uses a simple logging system to display information during the scanning process. The logging functions are:

- **log**: General logs for debugging and information.
- **warn**: Warnings when something isn't ideal but doesn't prevent functionality.
- **error**: Errors that occur during the scanning process.

```ts
// Enable debug logging
process.env.DEBUG = "true";

import { getAllSteamGames } from "steam-library-scanner";

// Path to your Steam installation directory
const steamPath = "C:\\Program Files (x86)\\Steam";
// Your Steam User ID
const userId = "123456789";

getAllSteamGames(steamPath, userId)
	.then((games) => {
		console.log("Steam Games:", games.steamGames);
		console.log("Non-Steam Games:", games.nonSteamGames);
		console.log("All Games Combined:", games.all);
	})
	.catch((error) => {
		console.error("Error retrieving all games:", error);
	});
```

## Notes

- Ensure that the Steam installation path (`steamPath`) is correct.
- You must provide your **Steam User ID** to access the `shortcuts.vdf` file in your user data folder for non-Steam games.
- The library works with both 32-bit and 64-bit versions of Steam.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/steam-library-scanner/issues) if you want to contribute.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
