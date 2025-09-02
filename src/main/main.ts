/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
const ffmpegPath = require('ffmpeg-static');
import fs from 'fs-extra'

// Disable no-unused-vars, broken for spread args
const ffmpeg = require('fluent-ffmpeg');

  ffmpeg.setFfmpegPath(ffmpegPath);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
   // Load the Vite-built index.html
      if (process.env.NODE_ENV === 'development') {
          mainWindow.loadURL('http://localhost:5173'); // Vite's default dev server port
      } else {
          mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('convert-video', async (_, inputPath, options) => {
   // Create temporary input file
    // const tempDir = path.join(__dirname, 'temp');
    // if (!fs.existsSync(tempDir)) {
    //   fs.mkdirSync(tempDir);
    // }
    // const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    // // const outputPath = path.join(tempDir, `output_${Date.now()}.${outputFormat}`);

    // // Write buffer to temporary file
    // await fs.writeFile(inputPath, videoBuffer);
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      ffmpeg(inputPath)
        .inputOptions([])
        .outputOptions(options.outputOptions || [])
        .videoCodec(options.videoCodec || 'libx264')
        .audioCodec(options.audioCodec || 'aac')
        .format(options.format || 'matroska')
        .on('error', (error) => {
          reject(new Error(`FFmpeg error: ${error.message}`));
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          console.log("BUFFEER IS HERE ::::::::::::", buffer);
          resolve(buffer);
        })
        .pipe(null, { end: true })
        .on('data', (chunk) => {
          chunks.push(chunk);
        });
    } catch (error) {
      reject(error);
    }
  });
});

ipcMain.handle('remove-audio', async (_, inputPath, output) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
    .noAudio() // Remove audio
    .outputOptions('-c', 'copy') // Copies video stream without re-encoding
    .save(output)
    .on('end', () => { 
      console.log('************ Audio removed from video ************')
      return {success: true, output}
    })
    .on('error', (err: any) => {
      console.error('Error during audio removal:', err)
      return { success: false, error: err.message };
    });
  });
});

// Handle the 'save-blob' request from the renderer
  ipcMain.handle('save-blob', async (event, buffer, filename) => {
      try {
          const today = new Date();
          const date = today.getFullYear()+'.'+(today.getMonth()+1)+'.'+today.getDate();
          const time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
          const pathName = date+'-'+time;
          const downloadsPath = path.join(app.getPath('downloads'), `recordings/${pathName}`);
          fs.ensureDirSync(downloadsPath);
          const filePath = path.join(downloadsPath, filename);
          fs.writeFileSync(filePath, buffer);
          return { success: true, filePath };
      } catch (error: any) {
          console.error('Failed to save audio:', error);
          return { success: false, error: error.message };
      }
  });

  ipcMain.handle('get-folder-content', async (event, folderPath) => {
    try {
        // const downloadsPath = path.join(app.getPath('downloads'), `recordings`);
        const items = await fs.promises.readdir(folderPath, { withFileTypes: true });
        const content = items.map(item => {
            return {
                ...item,
                isDirectory: item.isDirectory(),
                isFile: item.isFile()
            };
        });
        return content;
    } catch (error) {
        console.error('Failed to read directory:', error);
        return [];
    }
});

ipcMain.handle('read-file-as-blob', async (event, filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath); // Or use fs.readFile for async
    // In Electron's renderer process (which is a Chromium environment),
    // you can create a Blob directly from a Buffer.
    // However, sending the raw buffer through IPC is more straightforward.
    return fileBuffer; 
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
