import React, { useEffect, useState } from 'react';

import { TFile, useUploadFiles } from './hooks';
const send = require('../../../../../../../assets/clip.svg') as string;
const capture = require('../../../../../../../assets/video-camera-record-camera-movie-svgrepo-com.svg') as string;
const screenRecordIcon = require('../../../../../../../assets/screen-alt-svgrepo-com.svg') as string;
const startRecordingIcon = require('../../../../../../../assets/start-recording.svg') as string;
const stopRecordingIcon = require('../../../../../../../assets/stop-recording.svg') as string;
const trashIcon = require('../../../../../../../assets/trash.svg') as string;
const acceptIcon = require('../../../../../../../assets/accept.svg') as string;
const minusIcon = require('../../../../../../../assets/close.svg') as string;
import './style.scss';
import Webcam from './webcam'
import ReactModal from 'react-modal'
import { ReactMediaRecorder } from 'react-media-recorder'


type Props = {
  onClick: (e: any) => void;
  screenRecording: boolean;
  setScreenRecording: (e: boolean) => void;
};

export const FileUpload: React.FC<Props> = ({ onClick, screenRecording, setScreenRecording }) => {
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

  const acceptScreenRecording = (mediaBlobUrl: string) => {
    fetch(mediaBlobUrl)
      .then(response => response.blob())
      .then(blob => {
        handleBlob(blob);
      });
    setScreenRecording(false)
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

      <ReactModal
        isOpen={screenRecording}
        style={{
          overlay: {
              zIndex: 9999999999,
          },
        }}
      >
        <div className="screen-recorder-container">
          <ReactMediaRecorder
            screen
            render={({ status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl }) => (
              <div>
                {status === 'stopped' && mediaBlobUrl && (
                  <>
                    <video src={mediaBlobUrl} controls autoPlay loop />
                    <div className="screen-recorder-buttons">
                      <button className="screen-recorder-button clear-recording" onClick={clearBlobUrl}>
                        <img src={trashIcon} alt="Clear Recording" />
                        <p>Clear Recording</p>
                      </button>
                      <button className="screen-recorder-button accept-recording" onClick={() => acceptScreenRecording(mediaBlobUrl)}>
                        <img src={acceptIcon} alt="Accept Recording" />
                        <p>Accept Recording</p>
                      </button>
                    </div>
                  </>
                )}
                {status === 'idle' ? (
                  <div className="idle-screen-recorder-buttons">
                    <button className="screen-recorder-button" onClick={startRecording}>
                      <img src={startRecordingIcon} alt="Start Screen Recording" />
                      <p>Start Screen Recording</p>
                    </button>
                    <button className="screen-recorder-button cancel-recording" onClick={() => setScreenRecording(false)}>
                      <img src={minusIcon} alt="Cancel" />
                      <p>Cancel</p>
                    </button>
                  </div>
                ) : null}
                {status === 'recording' ? (
                  <button className="screen-recorder-button" onClick={stopRecording}>
                    <img src={stopRecordingIcon} alt="Stop Recording" />
                    <p>Stop Recording</p>
                  </button>
                ) : null}
              </div>
            )}
          />
        </div>
      </ReactModal>

      <div className="image-upload">
        <label htmlFor="upload-photo">
          <img src={send} />
        </label>
        <input accept="image/*,video/*" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
      </div>
      {!isMobile ? (
        <>
          <div className="image-capture">
            <label htmlFor="upload-capture" onClick={() => {setIsOpen(true); setShouldInitializeWebcam(true)}}>
              <img src={capture} />
            </label>
          </div>
          <div className="screeen-capture">
            <label htmlFor="screeen-capture" onClick={() => {setScreenRecording(!screenRecording)}}>
              <img src={screenRecordIcon} />
            </label>
          </div>
        </>
      ) : null}
      
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
