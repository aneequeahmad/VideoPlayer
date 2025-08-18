import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

export default DragDrop = (props) => {
  const { handleDrop, onFileChange } = props;

  return (
    <>
      <div
        className="drag-drop-container"
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <span class="fake-btn">Choose files</span>
        <span class="file-msg">or drag and drop files here</span>
        <input
          type="file"
          id="videoFileInput"
          className="file-input"
          accept="video/*"
          onChange={onFileChange}
        ></input>
      </div>
    </>
  );
};
