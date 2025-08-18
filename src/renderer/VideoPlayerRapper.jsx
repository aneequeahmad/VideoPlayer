import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

import VideoPlayer from './VideoPlayer';
import DragDrop from './DragDrop';
import { FaArrowRotateRight } from 'react-icons/fa6';

export default function VideoPlayerRapper() {
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
    <>
      <DragDrop handleDrop={handleDrop} onFileChange={onFileChange} />
      <div style={{ width: '600px', height: '400px' }}>
        <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
      </div>
      <div className="rotate-icon" onClick={onRotateIconClick}>
        <FaArrowRotateRight />
      </div>
      <div>
        <Link to="/">
          <button className="home-btn">Home</button>
        </Link>
      </div>
    </>
  );
}
