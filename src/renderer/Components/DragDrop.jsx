import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

export default DragDrop = (props) => {
  const { handleDrop, onFileChange } = props;

  return (
    <>
      <div
        style={styles.dragDropContainer}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <span style={styles.fakeBtn}>Choose files</span>
        <span style={styles.fileMsg}>or drag and drop files here</span>
        <input
          type="file"
          id="videoFileInput"
          style={styles.fileInput}
          accept="video/*"
          onChange={onFileChange}
        ></input>
      </div>
    </>
  );
};

const styles = {
  dragDropContainer: {
    width: '550px',
    backgroundColor: '#868287',
    marginBottom: '2rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '100%',
    padding: '25px',
    border: '1px dashed rgba(255, 255, 255, 0.4)',
    borderRadius: '3px',
    transition: '0.2s',
    /* &.is-active {
    background-color: rgba(255, 255, 255, 0.05);
  } */
  },
  fakeBtn: {
    flexShrink: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    padding: '8px 15px',
    marginRight: '10px',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  fileMsg: {
    fontSize: 'small',
    fontWeight: '300',
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileInput: {
    position: 'absolute',
    left: '0',
    top: '0',
    height: '100%',
    width: '100%',
    cursor: 'pointer',
    opacity: '0',
    '&:focus': {
      outline: 'none',
    },
  },
};
