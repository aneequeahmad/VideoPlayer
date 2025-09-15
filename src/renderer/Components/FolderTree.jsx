// FolderTree.jsx
import React, { useEffect, useState } from 'react';

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

  return (
    <div>
      {/* <h3>Folder Structure</h3> */}
      {tree ? (
        <FolderNode node={tree} onFileClick={onFileClick} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
