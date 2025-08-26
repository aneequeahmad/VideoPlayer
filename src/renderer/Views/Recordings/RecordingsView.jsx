import React, { useRef, useState, useCallback, useEffect } from 'react';
import VideoPlayer from '../Editor/VideoPlayer';

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
      setCurrentPath(path);
      const content = await window.electronAPI.getFolderContent(path);
      console.log('Folder content >>>>>>', content);
      setFolderContent(content);
    }
  };
  return (
    <div style={styles.recordingsContainer}>
      <FolderStructure
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
        setFilePath={setFilePath}
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
      {!!filePath ? (
        <div style={styles.videoPlayerContainer}>
          <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
        </div>
      ) : null}
    </div>
  );
}

const FolderStructure = ({ currentPath, setCurrentPath, setFilePath }) => {
  // Only show folder structure from the recordings folder
  const recordingsRoot = '/Users/aneequeahmad/Downloads/recordings';
  const relativePath = currentPath.replace(recordingsRoot, '');
  console.log('Relative Path >>>>', relativePath);
  // Split the relative path into folders
  const folders = relativePath.split('/').filter(Boolean);
  console.log('Folders >>>>', folders);

  return (
    <div style={{ position: 'absolute', top: 10, left: 0 }}>
      <span>
        <a
          href="#"
          style={{
            marginRight: 5,
            fontSize: 12,
            textDecoration: 'underline',
          }}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPath(recordingsRoot);
            //setFilePath('');
          }}
        >
          recordings
        </a>
        {folders.length > 0 && <span style={{ fontSize: 12 }}>/</span>}
      </span>
      {folders.map((folder, idx) => {
        const pathUpTo =
          recordingsRoot + '/' + folders.slice(0, idx + 1).join('/');
        return (
          <span key={pathUpTo}>
            <a
              href="#"
              style={{
                marginRight: 5,
                fontSize: 12,
                textDecoration: 'underline',
              }}
              onClick={(e) => {
                e.preventDefault();
                setCurrentPath(pathUpTo);
                // setFilePath('');
              }}
            >
              {folder}
            </a>
            {idx < folders.length - 1 && <span>/</span>}
          </span>
        );
      })}
    </div>
  );
};

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
    top: '30px',
  },
  videoPlayerContainer: {
    width: '600px',
    height: '400px',
  },
};
