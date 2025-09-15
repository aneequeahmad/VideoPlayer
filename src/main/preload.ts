// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from 'electron';
import { remove } from 'fs-extra';

export type Channels = 'ipc-example';

contextBridge.exposeInMainWorld('ffmpegAPI', {
  convertVideo: (input: string, output: string) =>
    ipcRenderer.invoke('convert-video', input, output),
  processFrame: (videoPath: string, timestamp: any, width: any, height: any, filter: any) =>
    ipcRenderer.invoke('process-frame', videoPath, timestamp, width, height, filter),
  removeAudio: (input: string, output: string) =>
    ipcRenderer.invoke('remove-audio', input, output),
  generateThumbnail: (options) => 
    ipcRenderer.invoke('generate-thumbnail', options),
  mergeVideosSideBySide: (data) => ipcRenderer.invoke('merge-videos-side-by-side', data),
});
contextBridge.exposeInMainWorld('electronAPI', {
    // Expose a function to save audio that invokes the main process handler
    getFilePath: (file: any) => {
      const path = webUtils.getPathForFile(file);
      return path;
    },
    saveBlob: (buffer: any, filename: String, videoPath: String) => ipcRenderer.invoke('save-blob', buffer, filename, videoPath),
    copyBlob: (buffer: any, filename: String, path: String) => ipcRenderer.invoke('copy-blob', buffer, filename, path),
    getFolderContent: (folderPath: string) => ipcRenderer.invoke('get-folder-content', folderPath),
    readFileAsBlob: (filePath: string) => ipcRenderer.invoke('read-file-as-blob', filePath),
    getFolderTree: async (dirPath) => await ipcRenderer.invoke("get-folder-tree", dirPath),
});


const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
