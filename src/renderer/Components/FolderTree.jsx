// FolderTree.jsx
import React, { useEffect, useState } from 'react';
import ImportFile from './ImportFile';
import { fileToBuffer } from '../../Utils';

const FolderNode = ({ node, onFileClick }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginLeft: '16px' }}>
      {node.type === 'folder' ? (
        <div>
          <span
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '📂' : '📁'} {node.name}
          </span>
          {expanded &&
            node.children?.map((child, idx) => (
              <FolderNode
                key={idx}
                style={{ padding: '5px' }}
                node={child}
                onFileClick={onFileClick}
              />
            ))}
        </div>
      ) : node.name !== '.DS_Store' ? (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => onFileClick(node.path)}
        >
          📄 {node.name}
        </div>
      ) : null}
    </div>
  );
};

export default function FolderTree({ rootPath, onFileClick }) {
  const [tree, setTree] = useState(null);

  useEffect(() => {
    async function fetchTree() {
      try {
        const folderTree = await window.electronAPI.getFolderTree(rootPath);
        setTree(folderTree);
      } catch (err) {
        console.error('Error loading tree:', err);
      }
    }
    fetchTree();
  }, [rootPath]);
  console.log('FOLDER TREE >>>>>', tree);

  const onFileChange = async (event) => {
    const file = event.target.files?.[0];
    const absoluteFilePath = await window.electronAPI.getFilePath(file);
    //const splitPath = absoluteFilePath.split(file.name);
    const item = {
      name: file.name,
      path: absoluteFilePath, //Setting path without name of file in it
      type: 'file',
    };
    console.log('ITEM IS *********', item);
    const assetsFolder = tree.children.find(
      (child) => child.name === 'assets' && child.type === 'folder',
    );
    if (assetsFolder) {
      // Add the new object to assets children array
      assetsFolder.children.push(item);
      console.log('Object added to assets directory', assetsFolder.path);
    } else {
      console.log('Assets folder not found');
    }
    // Update the tree state to reflect the new file addition
    setTree({ ...tree });
    const vidBuffer = await fileToBuffer(file);
    // Call the secure function from the preload script
    const result = await window.electronAPI.copyBlob(
      vidBuffer,
      file.name,
      assetsFolder.path,
    );
    if (result.success) {
      console.log('File copied successfully to ********* ', result.filePath);
    }
  };

  return (
    <div>
      <div>
        {/* <h3>Folder Structure</h3> */}
        {tree ? (
          <FolderNode node={tree} onFileClick={onFileClick} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div style={styles.importFileContainer}>
        <ImportFile onFileChange={onFileChange} />
      </div>
    </div>
  );
}

const styles = {
  importFileContainer: {
    position: 'absolute',
    top: '3.7rem',
    left: '10px',
  },
};
