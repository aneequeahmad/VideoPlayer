import React, { useRef, useState, useCallback, useEffect } from 'react';
import VideoPlayer from '../Editor/VideoPlayer';
import video from 'fluent-ffmpeg/lib/options/video';

export default function RecordingsView() {
  const playerRef = useRef(null);
  const [filePath, setFilePath] = useState('');
  const [currentPath, setCurrentPath] = useState(
    '/Users/aneequeahmad/Downloads/recordings', // Example path
  ); // Initial path
  const [folderContent, setFolderContent] = useState([]);

  const videoJsOptions = {
    responsive: true,
    fluid: true,
    sources: [
      {
        src: filePath,
        type: 'video/mp4', // Assuming mp4 for simplicity
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

  useEffect(() => {
    fetchFolderContent(currentPath);
  }, [currentPath]);

  const fetchFolderContent = async (path, item) => {
    if (item && item.isFile) {
      // Handle file opening logic here
      const fileBuffer = await window.electronAPI.readFileAsBlob(
        `${item.path}/${item.name}`,
      );
      const blob = new Blob([fileBuffer]);
      const objectUrl = URL.createObjectURL(blob);
      setFilePath(objectUrl);
      // You can use objectUrl to preview or play the file
    } else {
      const content = await window.electronAPI.getFolderContent(path);
      console.log('Folder content >>>>>>', content);
      setFolderContent(content);
    }
  };
  return (
    <div style={styles.recordingsContainer}>
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
      {!!filePath ? (
        <div style={styles.videoPlayerContainer}>
          <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  recordingsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  folderFileList: {
    position: 'absolute',
    left: '0',
    width: '200px',
    overflowY: 'auto',
    borderRight: '1px solid #000',
    padding: '10px',
    height: '100vh',
    top: '0',
  },
  videoPlayerContainer: {
    width: '600px',
    height: '400px',
  },
};
