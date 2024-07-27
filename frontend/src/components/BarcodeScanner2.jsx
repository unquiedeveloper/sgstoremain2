import React, { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner2 = ({ onScan }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromInputVideoDevice(undefined, videoRef.current)
      .then((result) => {
        onScan(result.text);
      })
      .catch((err) => console.error(err));

    return () => {
      codeReader.reset();
    };
  }, [onScan]);

  return (
    <video ref={videoRef} style={{ width: '100%' }} />
  );
};

export default BarcodeScanner2;
