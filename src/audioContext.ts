let WAContext = window.AudioContext || (window as any).webkitAudioContext;
export const context = new WAContext();
