export const info = (...args) => console.log(new Date().toISOString(), 'INFO', ...args);
export const warn = (...args) => console.warn(new Date().toISOString(), 'WARN', ...args);
export const error = (...args) => console.error(new Date().toISOString(), 'ERROR', ...args);

export default { info, warn, error };
