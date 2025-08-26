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

  const onRotateIconClick = async () => {
    const msg = await window.ffmpegAPI.convertVideo(
      absolutePath,
      '/Users/aneequeahmad/Documents/ai-sample-videos/latest-rotated-video.mp4',
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

      <div style={styles.rotateIcon} onClick={onRotateIconClick}>
        <FaArrowRotateRight />
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
  rotateIcon: {
    position: 'absolute',
    top: '8rem',
    left: '10px',
    fontSize: '24px',
    color: 'black',
    cursor: 'pointer',
    width: '40px',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px',
    borderRadius: '5px',
  },
};
