import React, { useEffect } from 'react';

import { useUploadFiles } from './hooks';
const send = require('../../../../../../../assets/clip.svg') as string;
import './style.scss';

type Props = {
  onClick: (e: any) => void;
  setImageFile: React.Dispatch<React.SetStateAction<string>>;
};

export const FileUpload: React.FC<Props> = ({ onClick, setImageFile }) => {
  const [files, selectFiles,] = useUploadFiles();
  
  useEffect(() => {
    console.log('useEffect in widget')
    if (files.length) {
      onClick(files);
      if (files[0].source) {
        setImageFile(files[0].source)
      }
    }
  }, [files]);
  
  return (
    <div className="image-upload">
      <label htmlFor="upload-photo">
        <img src={send} />
      </label>
      <input accept="image/*" onChange={selectFiles} type="file" multiple name="photo" id="upload-photo" />
    </div>
  );
};
