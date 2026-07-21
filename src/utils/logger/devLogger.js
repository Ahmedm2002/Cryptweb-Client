const isDev = import.meta.env.DEV;

console.log(`Dev env: ${isDev}`);

function createLogger(namespace) {
  const prefix = `[${namespace}]`;

  return {
    log: (...args) => {
      if (isDev) console.log(prefix, ...args);
    },
    warn: (...args) => {
      if (isDev) console.warn(prefix, ...args);
    },
    error: (...args) => {
      if (isDev) console.error(prefix, ...args);
    },
    info: (...args) => {
      if (isDev) console.info(prefix, ...args);
    },
  };
}

export default createLogger;
