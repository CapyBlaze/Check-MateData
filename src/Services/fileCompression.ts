import { gzipSync } from 'fflate';


const MAX_SIZE_FILE = 50 * 1024; // 50 Ko

export interface CompressionOutput {
    data?: Uint8Array;
    error?: string;
}

export async function fileCompression(file: File): Promise<CompressionOutput> {
    if (file.size === 0) return { 
        error: 'Le fichier est vide.' 
    };
    
    if (file.size > MAX_SIZE_FILE) return { 
        error: 'Le fichier dépasse la taille maximale de 50 Ko.' 
    };


    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Input = new Uint8Array(arrayBuffer);

        const compressed = gzipSync(uint8Input, { level: 9, mem: 12 });

        const isEffective = compressed.length < uint8Input.length;
        
        return {
            data: isEffective ? compressed : uint8Input
        };

    } catch {
        return { 
            error: 'Erreur lors de la lecture du fichier.' 
        };
    }
}