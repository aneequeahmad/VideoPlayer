import React from 'react';

export const FolderPath = ({ currentPath, setCurrentPath }) => {
  // Only show folder structure from the recordings folder
  const recordingsRoot = '/Users/aneequeahmad/Downloads/recordings';
  const relativePath = currentPath.replace(recordingsRoot, '');
  console.log('Relative Path >>>>', relativePath);
  // Split the relative path into folders
  const folders = relativePath.split('/').filter(Boolean);

  return (
    <div style={styles.folderPathContainer}>
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
  folderPathContainer: {
    marginBottom: '10px',
  },
};
