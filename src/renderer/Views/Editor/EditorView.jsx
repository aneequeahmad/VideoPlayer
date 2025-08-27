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
  const [absolutePath, setAbsolutePath] = useState('');

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

  const onRotateBtnClick = async () => {
    const msg = await window.ffmpegAPI.convertVideo(
      absolutePath,
      '/Users/aneequeahmad/Documents/ai-sample-videos/latest-rotated-video.mp4',
    );
  };

  const onUnsharpBtnClick = async () => {
    const outputPath =
      '/Users/aneequeahmad/Documents/ai-sample-videos/latest-unsharp-video.mp4';
    const msg = await window.ffmpegAPI.unsharpVideo(absolutePath, outputPath);
    // After processing, update the video player to play the new unsharp video
    const objectURL = URL.createObjectURL(
      new File(
        [await window.electronAPI.readFileAsBlob(outputPath)],
        'latest-unsharp-video.mp4',
        { type: 'video/mp4' },
      ),
    );
    console.log('Object URL >>>>>', objectURL);
    setFilePath(objectURL);
    setFileType('video/mp4');
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

  return (
    <div style={styles.editorContainer}>
      <div style={styles.videoPlayerContainer}>
        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
      <BackButton />
      <div style={styles.importFileContainer}>
        <DragDrop handleDrop={handleDrop} onFileChange={onFileChange} />
      </div>

      <div
        style={{ ...styles.filterBtn, ...styles.rotateIcon }}
        onClick={onRotateBtnClick}
      >
        <FaArrowRotateRight />
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.unShapBtn }}
        onClick={onUnsharpBtnClick}
      >
        Unsharp
      </div>
      <div
        style={{ ...styles.filterBtn, ...styles.removeAudioBtn }}
        onClick={onRemoveAudioClick}
      >
        Remove Audio
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
  unShapBtn: {
    top: '12rem',
  },
  removeAudioBtn: {
    top: '15rem',
  },
};
