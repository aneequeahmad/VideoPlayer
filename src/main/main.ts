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
import { buildVideoFilter } from '../Utils';

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

// Generate single thumbnail
ipcMain.handle('generate-thumbnail', async (event, options) => {
  const { 
    videoBuffer, 
    timeInSeconds = 5, 
    width = 200, 
    height = 150,
    quality = 2  // 1-31, lower is better quality
  } = options;

  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `thumb_${Date.now()}.jpg`);

    await fs.writeFile(inputPath, videoBuffer);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(timeInSeconds)
        .frames(1)
        .size(`${width}x${height}`)
        .outputOptions([`-q:v ${quality}`])
        .output(outputPath)
        .on('end', async () => {
          try {
            const thumbnailBuffer = await fs.readFile(outputPath);
            
            await fs.unlink(inputPath);
            await fs.unlink(outputPath);
            
            resolve({
              success: true,
              thumbnail: thumbnailBuffer,
              timestamp: timeInSeconds
            });
          } catch (error) {
            reject({ success: false, error: error.message });
          }
        })
        .on('error', async (error) => {
          try {
            if (fs.existsSync(inputPath)) await fs.unlink(inputPath);
            if (fs.existsSync(outputPath)) await fs.unlink(outputPath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          
          reject({ success: false, error: error.message });
        })
        .run();
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});


// Extract and process current frame
ipcMain.handle('process-frame', async (event, options) => {
  const { 
    inputPath, 
    currentTime, 
    effect = 'brightness',
    parameters = {} 
  } = options;

  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // const inputPath = path.join(tempDir, `input_${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `frame_${Date.now()}.jpg`);

    //await fs.writeFile(inputPath, videoBuffer);

    return new Promise((resolve, reject) => {
      // Build filter based on effect and parameters
      let videoFilter = buildVideoFilter(effect, parameters);
      console.log("************ VIDEO FILTER IN PROCESS FRAME **************", videoFilter);
      ffmpeg(inputPath)
        .seekInput(currentTime)
        .frames(1)
        .videoFilters(videoFilter)
        .size('640x480') // Fixed size for overlay
        .outputOptions(['-q:v 2']) // High quality
        .output(outputPath)
        .on('end', async () => {
          try {
            const frameBuffer = await fs.readFile(outputPath);
            
           // await fs.unlink(inputPath);
            await fs.unlink(outputPath);
            
            resolve({
              success: true,
              frameBuffer: frameBuffer,
              timestamp: currentTime,
              effect: effect,
              parameters: parameters
            });
          } catch (error) {
            reject({ success: false, error: error.message });
          }
        })
        .on('error', async (error) => {
          try {
            //if (fs.existsSync(inputPath)) await fs.unlink(inputPath);
            if (fs.existsSync(outputPath)) await fs.unlink(outputPath);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
          
          reject({ success: false, error: error.message });
        })
        .run();
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
});


// Handle the 'save-blob' request from the renderer
  ipcMain.handle('save-blob', async (event, buffer, filename, videoPath) => {
      try {
         console.log(">>>>>>>>>>>>>>>>. 0 <<<<<<<<<<<<<<<<", videoPath)  
          const today = new Date();
          const date = today.getFullYear()+'.'+(today.getMonth()+1)+'.'+today.getDate();
          const time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
          const pathName = date+'-'+time;
          let downloadsPath = path.join(app.getPath('downloads'), `recordings/${pathName}/assets`);
          if(videoPath) {
            const dirPath = path.dirname(videoPath)
            const pathBeforeAssets = dirPath.split('/').slice(0, -1).join('/');
            downloadsPath = path.join(pathBeforeAssets, 'exports');
            console.log(">>>>>>>>>>>>>>>>. 1 <<<<<<<<<<<<<<<<", downloadsPath)  
          } 
          fs.ensureDirSync(downloadsPath);
          const filePath = path.join(downloadsPath, filename);
          console.log("FILE PATH IN SAVE BLOB. >>>>>>>>>>>>>>>>>>", filePath)
          fs.writeFileSync(filePath, buffer);
          return { success: true, filePath };
      } catch (error: any) {
          console.error('Failed to save file:', error);
          return { success: false, error: error.message };
      }
  });
  function getFolderTree(dirPath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    path: dirPath,
    type: stats.isDirectory() ? "folder" : "file",
  };

  if (stats.isDirectory()) {
    info.children = fs.readdirSync(dirPath).map((child) =>
      getFolderTree(path.join(dirPath, child))
    );
  }
  return info;
}


  // Handle the 'save-blob' request from the renderer
  ipcMain.handle('copy-blob', async (event, buffer, filename, directoryPath) => {
      try {
          
          fs.ensureDirSync(directoryPath);
          const filePath = path.join(directoryPath, filename);
             
          // const filePath = path.join(path, filename);
          fs.writeFileSync(filePath, buffer);
          return { success: true, filePath };
      } catch (error: any) {
          console.error('Failed to copy file:', error);
          return { success: false, error: error.message };
      }
  });

     // ✅ Listen for requests from React
  ipcMain.handle("get-folder-tree", (event, dirPath) => {
      return getFolderTree(dirPath);
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

// Updated simple side-by-side merge with audio handling
ipcMain.handle('merge-videos-side-by-side', async (event, { videoPaths }) => {
  const tempFiles: string[] = [];
  
  try {
    const tempOutputPath = path.join(__dirname, `side_by_side_simple_${Date.now()}.mp4`);
    tempFiles.push(tempOutputPath);

    // Get video info to check for audio streams and framerates
    const videoInfo = await Promise.all(
      videoPaths.map(getVideoInfo)
    );

    const hasAudio = videoInfo.map(info => info.hasAudio);
    const targetDuration = Math.max(...videoInfo.map(info => info.duration));
    const framerates = videoInfo.map(info => info.fps || 30); // Default to 30 if not available
    const targetFramerate = Math.max(...framerates); // Use the highest framerate
    const numVideos = videoPaths.length;

    // Build arrays for stream references
    const scaledInputs: string[] = [];
    const audioStreams: string[] = [];

    // Start building the filter complex string
    let filterComplex = '';

    // Add scaling filters for each video with framerate conversion
    for (let i = 0; i < numVideos; i++) {
      filterComplex += `[${i}:v]scale=-1:360,fps=${targetFramerate}[scaled${i}];`;
      scaledInputs.push(`[scaled${i}]`);
      
      // Collect audio streams
      if (hasAudio[i]) {
        audioStreams.push(`[${i}:a]`);
      }
    }

    // Add hstack filter for video
    filterComplex += `${scaledInputs.join('')}hstack=inputs=${numVideos}[v]`;

    // Handle audio
    if (audioStreams.length > 0) {
      filterComplex += ';';
      if (audioStreams.length === 1) {
        // Single audio stream - just copy it
        filterComplex += `${audioStreams[0]}acopy[a]`;
      } else {
        // Multiple audio streams - mix them
        filterComplex += `${audioStreams.join('')}amix=inputs=${audioStreams.length}:duration=first,volume=${audioStreams.length}[a]`;
      }
    }

    // Build output options with proper framerate handling
    const outputOptions = [
      '-map', '[v]',
      '-t', targetDuration.toString(),
      '-preset', 'fast',
      '-crf', '23',
      '-shortest',
      '-vsync', 'vfr', // Use variable framerate
      '-movflags', '+faststart' // Enable faststart for web playback
    ];

    // Add audio mapping if audio exists
    if (audioStreams.length > 0) {
      outputOptions.push('-map', '[a]');
      outputOptions.push('-c:a', 'aac'); // Specify audio codec
      outputOptions.push('-b:a', '128k'); // Set audio bitrate
    } else {
      outputOptions.push('-an'); // No audio
    }

    // Add video codec specification
    outputOptions.push('-c:v', 'libx264'); // Specify video codec
    outputOptions.push('-pix_fmt', 'yuv420p'); // Ensure compatible pixel format

    await new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      // Add all video inputs
      videoPaths.forEach(path => command.input(path));

      command
        .complexFilter(filterComplex)
        .outputOptions(outputOptions)
        .output(tempOutputPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .run();
    });

    const buffer = await fs.readFile(tempOutputPath);
    console.log("BUFFER LENGTH AFTER MERGE **************", buffer.length);
    await cleanupTempFiles(tempFiles);
    
    return {
      success: true,
      buffer: buffer,
      size: buffer.length,
      type: 'video/mp4',
      hasAudio: audioStreams.length > 0
    };

  } catch (error) {
    console.error('Error in ffmpeg command', error);
    await cleanupTempFiles(tempFiles);
    throw error;
  }
});


// Helper function to get video information including audio streams
async function getVideoInfo(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.warn('Could not get video info, using defaults:', err);
        resolve({
          duration: 10,
          hasAudio: false,
          width: 640,
          height: 360
        });
      } else {
        const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        resolve({
          duration: metadata.format.duration || 10,
          hasAudio: hasAudio,
          width: videoStream?.width || 640,
          height: videoStream?.height || 360,
          codec: videoStream?.codec_name || 'h264'
        });
      }
    });
  });
}

// // Helper function to get video duration (keep this for compatibility)
// async function getVideoDuration(videoPath) {
//   const info = await getVideoInfo(videoPath);
//   return info.duration;
// }

async function cleanupTempFiles(files) {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await fs.unlink(file);
      }
    } catch (err) {
      console.warn('Could not delete temp file:', file, err);
    }
  }
}

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
