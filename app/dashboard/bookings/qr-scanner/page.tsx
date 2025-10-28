'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode } from 'lucide-react';

const QRScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      },
      false
    );

    function onScanSuccess(decodedText: string) {
      setScanResult(decodedText);
      scanner.clear();
    }

    function onScanFailure(error: any) {
      console.warn(`Code scan error = ${error}`);
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <QrCode className="h-24 w-24 text-gray-300 mb-6" />
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-800">
        QR Code Scanner
      </h1>
      <p className="max-w-md text-lg text-gray-600 mb-8">
        Use this page to scan your customers' QR codes to verify their bookings.
      </p>
      {scanResult ? (
        <div>
          <p>Scan Result: {scanResult}</p>
        </div>
      ) : (
        <div id="reader" style={{ width: '500px' }}></div>
      )}
    </div>
  );
};

export default QRScannerPage;
