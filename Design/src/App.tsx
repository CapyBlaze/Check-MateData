import { useState } from 'react';
import { ChessBackground } from './components/ChessBackground';
import { FileUploadCard } from './components/FileUploadCard';
import { ErrorPopup } from './components/ErrorPopup';

function App() {
  const [errors, setErrors] = useState<{ id: number; message: string }[]>([]);

  const addError = (message: string) => {
    const id = Date.now();
    setErrors((prev) => [...prev, { id, message }]);
  };

  const removeError = (id: number) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated Chess Background */}
      <ChessBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl">♛</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Chess<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-600">Cipher</span>
            </h1>
            <span className="text-5xl">♚</span>
          </div>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Transformez vos fichiers en parties d'échecs cryptées
          </p>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl justify-center items-center">
          {/* Encrypt Card */}
          <FileUploadCard
            title="Crypter"
            subtitle="Fichier → PGN"
            icon="encrypt"
            accentColor="purple"
            onError={addError}
          />

          {/* Divider */}
          <div className="hidden lg:flex flex-col items-center gap-2 px-4">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
            <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Mobile Divider */}
          <div className="lg:hidden flex items-center gap-4 w-full max-w-md">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
          </div>

          {/* Decrypt Card */}
          <FileUploadCard
            title="Décrypter"
            subtitle="PGN → Fichier"
            icon="decrypt"
            accentColor="emerald"
            onError={addError}
          />
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-sm mt-8">
          Vos fichiers restent privés et sont traités localement
        </p>
      </div>

      {/* Error Popups */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errors.map((error, index) => (
          <div key={error.id} style={{ transform: `translateY(${index * 10}px)` }}>
            <ErrorPopup
              message={error.message}
              onClose={() => removeError(error.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
