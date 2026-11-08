// Relative path supports both localhost and a GitHub Pages project subdirectory.
export const recognitionModelFolder = './models/recognition-v3/';
// Hinson's conservative starting values. Calibrate with separate real-piece tests.
export const recognitionOptions = Object.freeze({ threshold: 0.93, margin: 0.20 });
