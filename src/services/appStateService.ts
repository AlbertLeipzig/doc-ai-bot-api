let shuttingDown = false;

const setShuttingDown = (value) => {
  shuttingDown = Boolean(value);
};

const isShuttingDown = () => shuttingDown;


export const appState = {
  setShuttingDown,
  isShuttingDown,
};
