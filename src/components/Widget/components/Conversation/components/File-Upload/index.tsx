import React, { useEffect, useState } from 'react';

import { TFile, useUploadFiles } from './hooks';
const send = require('../../../../../../../assets/clip.svg') as string;
const capture = require('../../../../../../../assets/camera-shutter.svg') as string;
import './style.scss';
import Webcam from './webcam'
import ReactModal from 'react-modal'
import { useRecordWebcam } from 'react-record-webcam'

type Props = {
  onClick: (e: any) => void;
};

export const FileUpload: React.FC<Props> = ({ onClick }) => {
  const [files, selectFiles, deleteFile, handleBlob] = useUploadFiles();
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false)
  const [blob, setBlob] = useState<Blob>();
  const [shouldInitializeWebcam, setShouldInitializeWebcam] = useState(false)
  
  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 768;

  
  useEffect(() => {
    if (files.length) {
      onClick(files);
    }
  }, [files]);

  useEffect(() => {
    if(blob) {
      handleBlob(blob)
    }
  }, [blob])

  const updateOpen = () => {
    setIsOpen(!isOpen)
  }

  
  return (
    <>
      <ReactModal
        isOpen={isOpen}
        style={{
          overlay: {
              zIndex: 9999999999,
          },
          content: {
            width: 600,
            height: 350,
            margin: 'auto'
          }
        }}
      >
        <div className="webcam" style={{width: 600, height: 315, margin: 'auto'}}>
          <Webcam setBlob={setBlob} setIsOpen={updateOpen} shouldInitializeWebcam={shouldInitializeWebcam} setShouldInitializeWebcam={setShouldInitializeWebcam}/>
        </div>
      </ReactModal>
      <div className="image-upload">
        <label htmlFor="upload-photo">
          <img src={send} />
        </label>
        <input accept="image/*,video/*" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
      </div>
      {!isMobile ? 
        <div className="image-capture">
          <label htmlFor="upload-capture" onClick={() => {setIsOpen(true); setShouldInitializeWebcam(true)}}>
            <img src={capture} />
          </label>
        </div>
      :null}
      
      {isMobile ? (
          <>
            <div className="image-capture">
              <label htmlFor="upload-photo">
                <img src={capture} />
              </label>
              <input accept="image/*,video/*" capture="environment" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
            </div>
          </>
        ):null}
    </>
  );
};
