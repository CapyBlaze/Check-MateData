import { useState, useRef } from 'react';

interface FileUploadCardProps {
  title: string;
  subtitle: string;
  icon: 'encrypt' | 'decrypt';
  accentColor: string;
  onError: (message: string) => void;
}

export function FileUploadCard({ title, subtitle, icon, accentColor, onError }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    // Validation exemple
    if (selectedFile.size > 100 * 1024 * 1024) {
      onError('Le fichier est trop volumineux (max 100 MB)');
      return;
    }
    
    setFile(selectedFile);
    setProgress(0);
    setIsComplete(false);
    simulateProgress();
  };

  const simulateProgress = () => {
    setIsProcessing(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setIsProcessing(false);
        setIsComplete(true);
      }
      setProgress(Math.min(currentProgress, 100));
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    // Simulation du téléchargement
    const blob = new Blob(['[Event "Chess Cipher"]\n[Site "ChessCipher.app"]\n\n1. e4 e5 2. Nf3 Nc6'], { type: 'application/x-chess-pgn' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = icon === 'encrypt' ? 'encrypted.pgn' : 'decrypted.file';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setFile(null);
    setProgress(0);
    setIsProcessing(false);
    setIsComplete(false);
  };

  const gradientClass = icon === 'encrypt' 
    ? 'from-violet-500 to-purple-600' 
    : 'from-emerald-500 to-teal-600';

  const glowColor = icon === 'encrypt' 
    ? 'rgba(139, 92, 246, 0.5)' 
    : 'rgba(16, 185, 129, 0.5)';

  return (
    <div className="glass rounded-3xl p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: `0 8px 32px ${glowColor}` }}
        >
          {icon === 'encrypt' ? (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`file-drop-zone relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        } ${file ? 'border-solid' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          accept={icon === 'decrypt' ? '.pgn' : '*'}
        />

        {!file ? (
          <>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradientClass} bg-opacity-20 flex items-center justify-center`}>
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium mb-1">
              Glissez votre fichier ici
            </p>
            <p className="text-gray-500 text-sm">
              ou cliquez pour sélectionner
            </p>
            <p className="text-gray-600 text-xs mt-2">
              {icon === 'encrypt' ? 'Tous types de fichiers' : 'Fichiers .pgn uniquement'}
            </p>
          </>
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center justify-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-white font-medium truncate max-w-[180px]">{file.name}</p>
                <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-300 relative`}
                  style={{ width: `${progress}%` }}
                >
                  {isProcessing && (
                    <div className="absolute inset-0 progress-shimmer" />
                  )}
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2 text-center">
                {isProcessing ? `Traitement en cours... ${Math.round(progress)}%` : 
                 isComplete ? 'Terminé !' : 'Prêt'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {file && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={resetUpload}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleDownload}
            disabled={!isComplete}
            className={`flex-1 py-3 px-4 rounded-xl bg-gradient-to-r ${gradientClass} text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isComplete 
                ? 'hover:opacity-90 hover:scale-[1.02]' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ boxShadow: isComplete ? `0 4px 20px ${glowColor}` : 'none' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </button>
        </div>
      )}
    </div>
  );
}
