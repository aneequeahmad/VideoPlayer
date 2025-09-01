import React from 'react';
import { CiImport } from 'react-icons/ci';

export default ImportFile = (props) => {
  const { handleDrop, onFileChange } = props;

  return (
    <>
      <div
        style={styles.importFileContainer}
        //onDrop={handleDrop}
        //onDragOver={(event) => event.preventDefault()}
      >
        {/* <span style={styles.fakeBtn}>Import</span> */}
        <CiImport />
        {/* <span style={styles.fileMsg}>or drag and drop files here</span> */}
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
  importFileContainer: {
    width: '20px',
    backgroundColor: 'white',
    marginBottom: '2rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    padding: '5px',
    border: '1px dashed rgba(255, 255, 255, 0.4)',
    borderRadius: '3px',
    transition: '0.2s',
    '&:hover': {
      cursor: 'pointer',
    },
    /* &.is-active {
    background-color: rgba(255, 255, 255, 0.05);
  } */
  },
  // fakeBtn: {
  //   flexShrink: '0',
  //   backgroundColor: 'rgba(255, 255, 255, 0.04)',
  //   border: '1px solid rgba(255, 255, 255, 0.1)',
  //   borderRadius: '3px',
  //   padding: '8px 15px',
  //   marginRight: '10px',
  //   fontSize: '12px',
  //   textTransform: 'uppercase',
  //   fontWeight: '600',
  //   '&:hover': {
  //     cursor: 'pointer',
  //   },
  // },
  // fileMsg: {
  //   fontSize: 'small',
  //   fontWeight: '300',
  //   lineHeight: '1.4',
  //   whiteSpace: 'nowrap',
  //   overflow: 'hidden',
  //   textOverflow: 'ellipsis',
  // },
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
