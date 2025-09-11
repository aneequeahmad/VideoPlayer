import React, { useState, useRef, useEffect } from 'react';

import VideoPlayer from './VideoPlayer';
import ImportFile from '../../Components/ImportFile';
import { FaArrowRotateRight } from 'react-icons/fa6';
import BackButton from '../../Components/BackButton';
import { FolderPath } from '../../Components/FolderPath';
import { getPlayerManager } from '../../../Managers/PlayerManager';
import PlayersView from './PlayersView';

export default function EditorView() {
  const playerRef = useRef(null);
  // const [videoBuffer, setVideoBuffer] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [videoObjects, setVideoObjects] = useState([]);
  // const [processedFrame, setProcessedFrame] = useState(null);
  // const [fileType, setFileType] = useState('video/mp4');
  const [folderPath, setFolderPath] = useState(
    '/Users/aneequeahmad/Downloads/recordings', // Example path
  ); // Initial path
  const [folderContent, setFolderContent] = useState([]);
  // const [isProcessingVideo, setProcessingVideo] = useState(false);
  const [absolutePath, setAbsolutePath] = useState('');
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);

  useEffect(() => {
    fetchFolderContent(folderPath);

    const folderTree = window.api.getFolderTree(rootPath);
    console.log('FOLDER TREEEEE >>>>>>>>', folderTree);
  }, [folderPath]);

  // const handlePlayerReady = (player) => {
  //   playerRef.current = player;

  //   // You can handle player events here, for example:
  //   player.on('waiting', () => {
  //     videojs.log('player is waiting');
  //   });

  //   player.on('dispose', () => {
  //     videojs.log('player will dispose');
  //   });
  // };

  // const handleDrop = async (event) => {
  //   event.preventDefault();
  //   const file = event.dataTransfer.files?.[0];

  //   const absoluteFilePath = await window.ffmpegAPI.getFilePath(file);
  //   setAbsolutePath(absoluteFilePath);

  //   if (file) {
  //     const objectURL = URL.createObjectURL(file);
  //     setFilePath(objectURL);
  //     setFileType(file.type);
  //     // You can add further processing of the file here
  //   } else {
  //     console.log('No file selected');
  //   }
  // };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    const absoluteFilePath = await window.electronAPI.getFilePath(file);
    setAbsolutePath(absoluteFilePath);
    const splitPath = absoluteFilePath.split(file.name);
    const item = {
      name: file.name,
      path: splitPath[0], //Setting path without name of file in it
      isFile: true,
    };
    setFolderContent([...folderContent, item]);
    // const arrayBuffer = await blob.arrayBuffer();
    //   const buffer = new Uint8Array(arrayBuffer);
    const vidBuffer = await fileToBuffer(file);
    // Call the secure function from the preload script
    const result = await window.electronAPI.copyBlob(
      vidBuffer,
      file.name,
      folderPath,
    );
    if (result.success) {
      console.log('File copied successfully ');
    }
    // const vidBuffer = await fileToBuffer(file);
    // setVideoBuffer(vidBuffer);
    // if (file) {
    //   const objectURL = URL.createObjectURL(file);
    //   setFilePath(objectURL);
    //   setFileType(file.type);
    //   // You can add further processing of the file here
    //   //Reset EditFilters here
    //   setBrightness(0);
    //   setSaturation(1.0);
    //   setContrast(1.0);
    // } else {
    //   console.log('No file selected');
    // }
  };

  // // Convert file to buffer
  const fileToBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // const onRemoveAudioClick = async () => {
  //   const outputPath =
  //     '/Users/aneequeahmad/Documents/ai-sample-videos/no-audio-video.mp4';
  //   const msg = await window.ffmpegAPI.removeAudio(absolutePath, outputPath);
  //   // After processing, update the video player to play the new video without audio
  //   const objectURL = URL.createObjectURL(
  //     new File(
  //       [await window.electronAPI.readFileAsBlob(outputPath)],
  //       'latest-no-audio-video.mp4',
  //       { type: 'video/mp4' },
  //     ),
  //   );
  // };

  const onRotateBtnClick = async () => {
    const options = {
      outputOptions: ['-vf transpose=1', '-preset ultrafast'],
    };
    applyFfmpegCommands(options);
  };

  const onGreyScaleBtnClick = async () => {
    const options = {
      outputOptions: ['-vf format=gray', '-preset ultrafast'],
    };
    applyFfmpegCommands(options);
  };

  const onBlurEffectClick = async () => {
    const options = {
      outputOptions: ['-vf boxblur=5:1', '-preset ultrafast'],
    };
    applyFfmpegCommands(options);
  };

  const onSharpVideoClick = async () => {
    const options = {
      outputOptions: ['-vf unsharp=5:5:1.0:5:5:0.0', '-preset ultrafast'],
    };
    applyFfmpegCommands(options);
  };
  const onBrightnessChange = async (value) => {
    setBrightness(value);
    //setProcessingVideo(true);
    // const options = {
    //   outputOptions: [
    //     '-filter_complex',
    //     `[0:v]eq=brightness=${value}[v]`,
    //     '-map',
    //     '[v]',
    //     '-map',
    //     '0:a?', // include audio if exists
    //     '-c:a',
    //     'copy', // copy audio without re-encoding
    //   ],
    // };
    //applyFfmpegCommands(options);
    applyFfmpegCommandonCurrentFrame('all', {
      brightness: value,
      contrast: contrast,
      saturation: saturation,
    });
  };

  const onSaturationChange = (value) => {
    setSaturation(value);
    //setProcessingVideo(true);
    // const options = {
    //   outputOptions: [
    //     '-filter_complex',
    //     `[0:v]eq=saturation=${value}[v]`,
    //     '-map',
    //     '[v]',
    //     '-map',
    //     '0:a?', // include audio if exists
    //     '-c:a',
    //     'copy', // copy audio without re-encoding
    //   ],
    // };
    //applyFfmpegCommands(options);
    applyFfmpegCommandonCurrentFrame('all', {
      brightness: brightness,
      contrast: contrast,
      saturation: value,
    });
  };

  const onContrastChange = (value) => {
    setContrast(value);
    // setProcessingVideo(true);
    // const options = {
    //   outputOptions: [
    //     '-filter_complex',
    //     `[0:v]eq=contrast=${value}[v]`,
    //     '-map',
    //     '[v]',
    //     '-map',
    //     '0:a?', // include audio if exists
    //     '-c:a',
    //     'copy', // copy audio without re-encoding
    //   ],
    // };
    //applyFfmpegCommands(options);
    applyFfmpegCommandonCurrentFrame('all', {
      brightness: brightness,
      contrast: value,
      saturation: saturation,
    });
  };

  const applyFfmpegCommands = async (options) => {
    const vidBuffer = await window.ffmpegAPI.convertVideo(
      absolutePath,
      options,
    );
    //setVideoBuffer(vidBuffer);
    const blob = new Blob([vidBuffer], { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    setFilePath(blobUrl);
    if (playerRef.current) {
      const videoElement = playerRef.current.el();
      const overlay = videoElement.querySelector('.frame-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
    // setProcessingVideo(false);
  };

  const applyFfmpegCommandonCurrentFrame = async (effect, parameters) => {
    const playerManager = getPlayerManager();
    const currentTime = playerManager.currentTime;
    // Process frame using FFmpeg through Electron API

    const result = await window.ffmpegAPI.processFrame({
      inputPath: absolutePath,
      currentTime: currentTime,
      effect: effect,
      parameters: parameters,
    });
    if (result.success) {
      const blob = new Blob([result.frameBuffer], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      // Show overlay on VideoPlayer
      if (playerRef.current) {
        const videoElement = playerRef.current.el();
        let overlay = videoElement.querySelector('.frame-overlay');
        if (!overlay) {
          overlay = document.createElement('img');
          overlay.className = 'frame-overlay';
          overlay.style.position = 'absolute';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.pointerEvents = 'none';
          videoElement.appendChild(overlay);
          videoElement.style.position = 'relative';
        }
        overlay.src = url;
      }
      // setProcessingVideo(false);
      //setProcessedFrame(url);
      //drawOverlay(url);
    }
  };

  const onItemClick = async (path, item) => {
    if (item && item.isFile) {
      const playerManager = getPlayerManager();
      playerManager.init();
      // Handle file opening logic here
      const fileBuffer = await window.electronAPI.readFileAsBlob(path);
      const blob = new Blob([fileBuffer]);
      const videoUrl = URL.createObjectURL(blob);

      const result = await window.ffmpegAPI.generateThumbnail({
        videoBuffer: fileBuffer,
        timeInSeconds: 0,
        width: 320,
        height: 240,
        quality: 2,
      });

      if (result.success) {
        const blob = new Blob([result.thumbnail], { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        const videoObj = {
          videoUrl: videoUrl,
          previewUrl: previewUrl,
          path: path,
        };
        let allVideoObjArray = [...videoObjects, videoObj];
        allVideoObjArray = allVideoObjArray.slice(-2);
        setVideoObjects(allVideoObjArray);
      } else {
        //Thumbnail generation failed
      }

      //Reset EditFilters here
      setBrightness(0);
      setSaturation(1.0);
      setContrast(1.0);
    } else {
      fetchFolderContent(path);
    }
  };

  const fetchFolderContent = async (path) => {
    setFolderPath(path);
    const content = await window.electronAPI.getFolderContent(path);
    setFolderContent(content);
  };

  // const onVideoPreviewClick = (videoObj) => {
  //   setFilePath(videoObj.videoUrl);
  //   setAbsolutePath(videoObj.path);
  //   const playerManager = getPlayerManager();
  //   playerManager.init();
  //   if (playerRef.current) {
  //     const videoElement = playerRef.current.el();
  //     const overlay = videoElement.querySelector('.frame-overlay');
  //     if (overlay) {
  //       overlay.remove();
  //     }
  //   }
  // };

  const onApplyBtnClick = () => {
    const options = {
      outputOptions: [
        '-filter_complex',
        `[0:v]eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}[v]`,
        '-map',
        '[v]',
        '-map',
        '0:a?', // include audio if exists
        '-c:a',
        'copy', // copy audio without re-encoding
      ],
    };
    applyFfmpegCommands(options);
    // const playerManager = getPlayerManager();
    // playerManager.init();
  };
  const videoObjArray = videoObjects.slice(-2);

  return (
    <>
      <BackButton />
      <div style={styles.editorContainer}>
        <div style={styles.filtersContainer}>
          <div style={styles.recordingsList}>
            {/* <FolderPath
              currentPath={folderPath}
              setCurrentPath={setFolderPath}
            /> */}
            <div style={styles.folderFileList}>
              {folderContent.map((item, index) => (
                <div key={index}>
                  <div
                    style={styles.item}
                    onClick={() =>
                      onItemClick(`${item.path}/${item.name}`, item)
                    }
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.importFileContainer}>
              <ImportFile onFileChange={onFileChange} />
            </div>
          </div>
          <div>
            <div style={styles.filterBtn} onClick={onRotateBtnClick}>
              <FaArrowRotateRight />
            </div>
            <div style={styles.filterBtn} onClick={onGreyScaleBtnClick}>
              Grey Scale
            </div>
            <div style={styles.filterBtn} onClick={onBlurEffectClick}>
              Blur Effect
            </div>
            {/* <div style={styles.filterBtn} onClick={onRemoveAudioClick}>
              Remove Audio
            </div> */}
            <div style={styles.filterBtn} onClick={onSharpVideoClick}>
              Sharp
            </div>
            <div style={styles.filterBtn}>
              <label style={{ fontSize: '12px' }}>Brightness</label>
              <input
                style={{ width: '80px' }}
                type="range"
                min="-1"
                max="1"
                step="0.08"
                value={brightness}
                onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
              />
            </div>
            <div style={styles.filterBtn}>
              <label style={{ fontSize: '12px' }}>Saturation</label>
              <input
                style={{ width: '80px' }}
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={saturation}
                onChange={(e) => onSaturationChange(parseFloat(e.target.value))}
                //disabled={isProcessingVideo}
              />
            </div>
            <div style={styles.filterBtn}>
              <label style={{ fontSize: '12px' }}>Contrast</label>
              <input
                style={{ width: '80px' }}
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={contrast}
                onChange={(e) => onContrastChange(parseFloat(e.target.value))}
                //disabled={isProcessingVideo}
              />
            </div>
            <div style={styles.applyBtn} onClick={onApplyBtnClick}>
              <div>Apply</div>
            </div>
          </div>
        </div>
        <PlayersView videos={videoObjArray} />
        {/* <div style={styles.videoPlayerContainer}>
          <VideoPlayer
            src={filePath}
            options={videoJsOptions}
            onReady={handlePlayerReady}
          />
        </div> */}
        {/* <div style={styles.layoutsContainer}>
          {videoObjArray.map((videoObj) => (
            <div
              style={styles.layoutContainer}
              onClick={() => onVideoPreviewClick(videoObj)}
            >
              <img style={styles.layoutContainer} src={videoObj.previewUrl} />
            </div>
          ))}
        </div> */}
      </div>
    </>
  );
}

const styles = {
  editorContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem',
    marginRight: '2rem',
  },
  importFileContainer: {
    position: 'absolute',
    top: '3.7rem',
    left: '10px',
  },
  filtersContainer: {
    marginLeft: '0.5rem',
  },
  filterBtn: {
    fontSize: '16px',
    color: 'black',
    cursor: 'pointer',
    backgroundColor: 'white',
    padding: '5px',
    borderRadius: '5px',
    marginBottom: '0.5rem',
  },
  recordingsList: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '200px',
    marginBottom: '1rem',
  },
  folderFileList: {
    width: '200px',
    overflowY: 'auto',
    padding: '10px 0',
    height: '100vh',
  },
  item: {
    cursor: 'pointer',
    marginBottom: '0.25rem',
    backgroundColor: 'white',
    padding: '4px',
    borderRadius: '5px',
  },
  layoutsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  layoutContainer: {
    width: '200px',
    height: '150px',
    borderRadius: '5px',
    marginRight: '1rem',
    marginBottom: '1rem',
  },
  applyBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
