import React, { useEffect, useState } from 'react';

import { TFile, useUploadFiles } from './hooks';
const send = require('../../../../../../../assets/clip.svg') as string;
const capture = require('../../../../../../../assets/camera-shutter.svg') as string;
import './style.scss';

type Props = {
  onClick: (e: any) => void;
};

export const FileUpload: React.FC<Props> = ({ onClick }) => {
  const [files, selectFiles,] = useUploadFiles();
  const [width, setWidth] = useState<number>(window.innerWidth);

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
    console.log('useEffect in widget', files)
    if (files.length) {
      onClick(files);
    }
  }, [files]);
  
  return (
    <>
      <div className="image-upload">
        <label htmlFor="upload-photo">
          <img src={send} />
        </label>
        <input accept="image/*,video/*" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
      </div>
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
