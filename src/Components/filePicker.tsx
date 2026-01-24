import React, { useState, type ChangeEvent } from 'react';
import { fileCompression, type CompressionOutput } from '../Services/fileCompression';

const FileCompressor: React.FC = () => {
    const [result, setResult] = useState<CompressionOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;


        setIsLoading(true);
        setResult(null);

        const output = await fileCompression(file);
        
        setResult(output);
        setIsLoading(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <input 
                type="file" 
                onChange={handleFileChange} 
                disabled={isLoading}
            />
            
            {isLoading && <p>Traitement et compression en cours...</p>}


            {result?.error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    <p>Erreur: {result.error}</p>
                </div>
            )}


            {result?.data && !isLoading && (
                <div style={{ marginTop: '20px', color: 'green' }}>
                    <p>✅ Fichier traité avec succès !</p>
                    <p>Taille finale : {(result.data.length / 1024).toFixed(2)} Ko</p>
                </div>
            )}
        </div>
    );
};

export default FileCompressor;
