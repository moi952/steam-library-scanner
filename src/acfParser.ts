/**
 * Steam appmanifest_*.acf file parsing module
 */

export interface AcfGameInfo {
  [key: string]: string;
}

/**
 * Parses the contents of an ACF (Valve KeyValues ​​Format in text) file, extracting all key/value pairs.
 * @param content The textual content of the ACF file.
 * @returns An object with all extracted properties.
 */
export const parseAcfFile = (content: string): AcfGameInfo => {
  const gameInfo: AcfGameInfo = {};
  const lines = content.split("\n");

  lines.forEach((line) => {
    const match = line.match(/"([^"]+)"\s+"([^"]+)"/);
    if (match) {
      const key = match[1];
      const value = match[2];
      gameInfo[key] = value;
    }
  });

  return gameInfo;
};
