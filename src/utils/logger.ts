import chalk from "chalk";

const DEBUG_VALUES = ["1", "true", "yes"];
export const isDebug = DEBUG_VALUES.includes((process.env.DEBUG || "").toLowerCase());

export const log = (...args: any[]) => {
	if (isDebug) console.log(chalk.blue("[LOG]"), ...args);
};

export const warn = (...args: any[]) => {
	if (isDebug) console.warn(chalk.yellow("[WARN]"), ...args);
};

export const error = (...args: any[]) => {
	console.error(chalk.red("[ERROR]"), ...args);
};

export const info = (...args: any[]) => {
	if (isDebug) console.info(chalk.green("[INFO]"), ...args);
};
