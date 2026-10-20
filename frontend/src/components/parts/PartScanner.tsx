import { useState } from "react";
import { Barcode, Camera, Smartphone } from "lucide-react";

export default function PartScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Camera className="w-5 h-5 text-industrial-500" />
        <h3 className="text-lg font-bold">Lector de código de barras / QR</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Usá la cámara de tu tablet o PC para escanear el número de serie de la pieza.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <button
          onClick={() => setScanning(!scanning)}
          className="btn-primary flex-1 sm:max-w-xs flex items-center justify-center gap-2"
        >
          {scanning ? <Smartphone className="w-4 h-4 animate-pulse" /> : <Barcode className="w-4 h-4" />}
          {scanning ? "Detener escaneo" : "Iniciar escaneo"}
        </button>
        <button
          disabled={!result}
          onClick={() => {
            if (result) {
              window.location.href = `/traceability?serial=${result}`;
            }
          }}
          className="btn-secondary flex-1 sm:max-w-xs"
        >
          Ir a trazabilidad
        </button>
      </div>

      {scanning && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800 mb-2">
            <span className="font-bold">Modo escaneo activado:</span>
          </p>
          <p className="text-xs text-blue-600">
            Esta es una versión MVP. En producción integrá una librería como
            <code className="font-mono">html5-qrcode</code> o
            <code className="font-mono">zxing</code> para lectura real de cámara.
          </p>
          <input
            type="text"
            className="mt-2 input-field w-full"
            placeholder="Ingresá manualmente el número de serie escaneado..."
            onChange={(e) => setResult(e.target.value)}
            value={result || ""}
          />
        </div>
      )}
    </div>
  );
}