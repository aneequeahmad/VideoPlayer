import React, { useState, useRef, useEffect } from 'react';

import VideoPlayer from './VideoPlayer';
import DragDrop from '../../Components/DragDrop';
import { FaArrowRotateRight } from 'react-icons/fa6';
import BackButton from '../../Components/BackButton';
import { FolderPath } from '../../Components/FolderPath';

export default function EditorView() {
  const playerRef = useRef(null);
  const [videoBuffer, setVideoBuffer] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [fileType, setFileType] = useState('video/mp4');
  const [recordingsPath, setRecordingsPath] = useState(
    '/Users/aneequeahmad/Downloads/recordings', // Example path
  ); // Initial path
  const [folderContent, setFolderContent] = useState([]);
  const [isProcessingVideo, setProcessingVideo] = useState(false);
  const [absolutePath, setAbsolutePath] = useState('');
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);

  const videoJsOptions = {
    responsive: true,
    fluid: true,
    sources: [
      {
        src: filePath,
        type: 'video/mp4',
      },
    ],
  };

  useEffect(() => {
    fetchFolderContent(recordingsPath);
  }, [recordingsPath]);

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

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
    const vidBuffer = await fileToBuffer(file);
    setVideoBuffer(vidBuffer);
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setFilePath(objectURL);
      setFileType(file.type);
      // You can add further processing of the file here
      //Reset EditFilters here
      setBrightness(0);
      setSaturation(1.0);
      setContrast(1.0);
    } else {
      console.log('No file selected');
    }
  };

  // Convert file to buffer
  const fileToBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const onRemoveAudioClick = async () => {
    const outputPath =
      '/Users/aneequeahmad/Documents/ai-sample-videos/no-audio-video.mp4';
    const msg = await window.ffmpegAPI.removeAudio(absolutePath, outputPath);
    // After processing, update the video player to play the new video without audio
    const objectURL = URL.createObjectURL(
      new File(
        [await window.electronAPI.readFileAsBlob(outputPath)],
        'latest-no-audio-video.mp4',
        { type: 'video/mp4' },
      ),
    );
  };

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
    setProcessingVideo(true);
    const options = {
      outputOptions: [
        '-filter_complex',
        `[0:v]eq=brightness=${value}[v]`,
        '-map',
        '[v]',
        '-map',
        '0:a?', // include audio if exists
        '-c:a',
        'copy', // copy audio without re-encoding
      ],
    };
    applyFfmpegCommands(options);
  };

  const onSaturationChange = (value) => {
    setSaturation(value);
    setProcessingVideo(true);
    const options = {
      outputOptions: [
        '-filter_complex',
        `[0:v]eq=saturation=${value}[v]`,
        '-map',
        '[v]',
        '-map',
        '0:a?', // include audio if exists
        '-c:a',
        'copy', // copy audio without re-encoding
      ],
    };
    applyFfmpegCommands(options);
  };

  const onContrastChange = (value) => {
    setContrast(value);
    setProcessingVideo(true);
    const options = {
      outputOptions: [
        '-filter_complex',
        `[0:v]eq=contrast=${value}[v]`,
        '-map',
        '[v]',
        '-map',
        '0:a?', // include audio if exists
        '-c:a',
        'copy', // copy audio without re-encoding
      ],
    };
    applyFfmpegCommands(options);
  };

  const applyFfmpegCommands = async (options) => {
    const vidBuffer = await window.ffmpegAPI.convertVideo(videoBuffer, options);
    setVideoBuffer(vidBuffer);
    const blob = new Blob([vidBuffer], { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    setFilePath(blobUrl);
    setProcessingVideo(false);
  };

  const fetchFolderContent = async (path, item) => {
    if (item && item.isFile) {
      // Handle file opening logic here
      const fileBuffer = await window.electronAPI.readFileAsBlob(
        `${item.path}/${item.name}`,
      );
      const blob = new Blob([fileBuffer]);
      // const vidBuffer = await fileToBuffer(file);
      setVideoBuffer(fileBuffer);
      const objectUrl = URL.createObjectURL(blob);
      console.log('SETTING FILE PATH >>>>', objectUrl);
      setFilePath(objectUrl);
      // You can use objectUrl to preview or play the file
      //Reset EditFilters here
      setBrightness(0);
      setSaturation(1.0);
      setContrast(1.0);
    } else {
      setRecordingsPath(path);
      const content = await window.electronAPI.getFolderContent(path);
      console.log('Folder content >>>>>>', content);
      setFolderContent(content);
    }
  };

  return (
    <>
      <BackButton />
      {/* <div style={styles.importFileContainer}>
        <DragDrop onFileChange={onFileChange} />
      </div> */}
      <div style={styles.editorContainer}>
        <div style={styles.filtersContainer}>
          <div style={styles.filterBtn} onClick={onRotateBtnClick}>
            <FaArrowRotateRight />
          </div>
          <div style={styles.filterBtn} onClick={onGreyScaleBtnClick}>
            Grey Scale
          </div>
          <div style={styles.filterBtn} onClick={onBlurEffectClick}>
            Blur Effect
          </div>
          <div style={styles.filterBtn} onClick={onRemoveAudioClick}>
            Remove Audio
          </div>
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
              step="0.5"
              value={brightness}
              onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
              disabled={isProcessingVideo || !filePath}
            />
          </div>
          <div style={styles.filterBtn}>
            <label style={{ fontSize: '12px' }}>Saturation</label>
            <input
              style={{ width: '80px' }}
              type="range"
              min="0"
              max="3"
              step="0.5"
              value={saturation}
              onChange={(e) => onSaturationChange(parseFloat(e.target.value))}
              disabled={isProcessingVideo || !filePath}
            />
          </div>
          <div style={styles.filterBtn}>
            <label style={{ fontSize: '12px' }}>Contrast</label>
            <input
              style={{ width: '80px' }}
              type="range"
              min="0"
              max="2"
              step="0.5"
              value={contrast}
              onChange={(e) => onContrastChange(parseFloat(e.target.value))}
              disabled={isProcessingVideo || !filePath}
            />
          </div>
        </div>
        <div style={styles.videoPlayerContainer}>
          <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
        </div>
        <div style={styles.recordingsList}>
          <FolderPath
            currentPath={recordingsPath}
            setCurrentPath={setRecordingsPath}
          />
          <div style={styles.folderFileList}>
            {folderContent.map((item, index) => (
              <div key={index}>
                <div
                  onClick={() =>
                    fetchFolderContent(`${item.path}/${item.name}`, item)
                  }
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  editorContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem',
  },
  videoPlayerContainer: {
    width: '400px',
  },
  // importFileContainer: {
  //   position: 'absolute',
  //   top: '4rem',
  //   left: '10px',
  // },
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
  },
  folderFileList: {
    width: '200px',
    overflowY: 'auto',
    padding: '10px',
    height: '100vh',
  },
};
