import * as path from "path";
import * as os from "os";

/**
 * Normalizes a path by expanding ~ and correcting separators for each OS.
 */
export const normalizePath = (filePath: string): string => {
	if (filePath.startsWith("~")) {
		return path.join(os.homedir(), filePath.slice(1));
	}
	return path.normalize(filePath);
};
