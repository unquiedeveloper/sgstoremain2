// BarcodeScanner.js
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library';
import toast from 'react-hot-toast';

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [barcode, setBarcode] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          codeReader.decodeFromImage(undefined, imageSrc)
            .then(result => {
              setBarcode(result.text);
            })
            .catch(err => {
              console.error(err);
              toast.error("Scanning Failed ...");
            });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        height="auto"
      />
      <div>
        {barcode ? <p>Barcode: {barcode}</p> : <p>No barcode detected</p>}
      </div>
    </div>
  );
};

export default BarcodeScanner;
