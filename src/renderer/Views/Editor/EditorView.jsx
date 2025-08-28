import React, { useState, useRef } from 'react';
import '../../App.css';

import VideoPlayer from './VideoPlayer';
import DragDrop from '../../Components/DragDrop';
import { FaArrowRotateRight } from 'react-icons/fa6';
import { getViewManager } from '../../../Managers/ViewManager';
import BackButton from '../../Components/BackButton';

export default function EditorView() {
  const playerRef = useRef(null);
  const [filePath, setFilePath] = useState('');
  const [fileType, setFileType] = useState('');
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
        type: fileType,
      },
    ],
  };

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

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    const absoluteFilePath = await window.ffmpegAPI.getFilePath(file);
    setAbsolutePath(absoluteFilePath);

    if (file) {
      const objectURL = URL.createObjectURL(file);
      setFilePath(objectURL);
      setFileType(file.type);
      // You can add further processing of the file here
    } else {
      console.log('No file selected');
    }
  };

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    const absoluteFilePath = await window.ffmpegAPI.getFilePath(file);
    setAbsolutePath(absoluteFilePath);
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setFilePath(objectURL);
      setFileType(file.type);
      // You can add further processing of the file here
    } else {
      console.log('No file selected');
    }
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
    const videoBuffer = await window.ffmpegAPI.convertVideo(
      absolutePath,
      options,
    );
    const blob = new Blob([videoBuffer], { type: 'video/mp4' });
    const blobUrl = URL.createObjectURL(blob);
    setFilePath(blobUrl);
    setProcessingVideo(false);
  };

  return (
    <div style={styles.editorContainer}>
      <div style={styles.videoPlayerContainer}>
        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
      <BackButton />
      <div style={styles.importFileContainer}>
        <DragDrop onFileChange={onFileChange} />
      </div>

      <div
        style={{ ...styles.filterBtn, ...styles.rotateIcon }}
        onClick={onRotateBtnClick}
      >
        <FaArrowRotateRight />
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.greyScaleBtn }}
        onClick={onGreyScaleBtnClick}
      >
        Grey Scale
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.blurEffectBtn }}
        onClick={onBlurEffectClick}
      >
        Blur Effect
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.removeAudioBtn }}
        onClick={onRemoveAudioClick}
      >
        Remove Audio
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.sharpBtn }}
        onClick={onSharpVideoClick}
      >
        Sharp
      </div>
      <div style={{ ...styles.filterBtn, ...styles.brightnessSlider }}>
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
      <div style={{ ...styles.filterBtn, ...styles.saturationSlider }}>
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
      <div style={{ ...styles.filterBtn, ...styles.contrastSlider }}>
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
  );
}

const styles = {
  editorContainer: {
    display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  videoPlayerContainer: {
    width: '600px',
    height: '400px',
  },
  importFileContainer: {
    position: 'absolute',
    top: '4rem',
    left: '10px',
  },
  filterBtn: {
    position: 'absolute',
    left: '10px',
    fontSize: '16px',
    color: 'black',
    cursor: 'pointer',
    // width: '40px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px',
    borderRadius: '5px',
  },
  rotateIcon: {
    top: '8rem',
  },
  greyScaleBtn: {
    top: '12rem',
  },
  removeAudioBtn: {
    top: '15rem',
  },
  blurEffectBtn: {
    top: '18rem',
  },
  sharpBtn: {
    top: '21rem',
  },
  brightnessSlider: {
    top: '24rem',
  },
  saturationSlider: {
    top: '27rem',
  },
  contrastSlider: {
    top: '30rem',
  },
};
