export const isDebug = process.env.DEBUG === "true";

export const log = (...args: any[]) => {
  if (isDebug) console.log(...args);
};

export const warn = (...args: any[]) => {
  if (isDebug) console.warn(...args);
};

export const error = (...args: any[]) => {
  console.error(...args);
};
