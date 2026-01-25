import { gzipSync } from 'fflate';
import { Chess } from "chess.js";



const MAX_SIZE_FILE = 50 * 1024; // 50 Ko

export interface EncryptionProgress {
    stage?: 'ERROR' | 'COMPRESSING' | 'ENCODING' | 'ENDED';
    totalBytes?: number;
    remainingByte?: number;
    remainingPercentage?: number;
    error?: 'EMPTY_FILE' | 'FILE_TOO_LARGE' | 'READING_ERROR';
}


export async function encryptFile(
    file: File,
    onProgress?: (output: EncryptionProgress) => void

): Promise<string[]> {
    
    if (file.size === 0) {
        onProgress?.({
            stage: 'ERROR',
            error: 'EMPTY_FILE'
        });
        return [];
    }
    
    if (file.size > MAX_SIZE_FILE) { 
        onProgress?.({ 
            stage: 'ERROR',
            error: 'FILE_TOO_LARGE'
        });
        return [];
    };

    onProgress?.({
        stage: 'COMPRESSING',
        remainingPercentage: 0
    })


    let dataFile: Uint8Array;
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Input = new Uint8Array(arrayBuffer);

        const compressed = gzipSync(uint8Input, { level: 9, mem: 12 });
        
        if (compressed.length < uint8Input.length) dataFile = compressed;
        else                                       dataFile = uint8Input;

        
    } catch {
        onProgress?.({
            stage: 'ERROR',
            error: 'READING_ERROR'
        });
        return [];
    }




    const binaryString = Array.from(dataFile)
        .map(byte => byte.toString(2).padStart(8, '0'))
        .join('');
    const binaryArray = binaryString.split('');
    const binaryLength = binaryArray.length;
    

    const chess = new Chess();
    const partyArray: string[] = [];
    let endGame = false;
    let tick = 0;

    while (binaryArray.length > 0) {
        onProgress?.({
            stage: 'ENCODING',
            totalBytes: binaryLength,
            remainingByte: binaryArray.length,
            remainingPercentage: 100 - ((binaryArray.length / binaryLength) * 100)
        });

        if (++tick % 200 === 0) {
            await new Promise(requestAnimationFrame);
        }

        if (chess.isGameOver() || endGame) {
            chess.setHeader('Event', 'Check-MateData');
            chess.setHeader('Site', 'Local party');
            chess.setHeader('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
            chess.setHeader('Round', partyArray.length + 1 + '');
            chess.setHeader('White', 'Player');
            chess.setHeader('Black', 'Bot');
            
            if (chess.isDraw() || chess.isStalemate()) {
                chess.setHeader('Result', '1/2-1/2');

            } else if (chess.isCheckmate()) {
                const winner = chess.turn() === 'w' ? 'Black' : 'White';
                chess.setHeader('Result', winner === 'White' ? '1-0' : '0-1');
            
            } else {
                chess.setHeader('Result', '*');
            }

            partyArray.push(chess.pgn({ newline: '\n' }));
            partyArray[partyArray.length - 1] += "\n";

            chess.reset();

            endGame = false;
        }


        const numberMoves = chess.moves().length;
        let numberBits;
        if (numberMoves == 1) {
            chess.move(chess.moves()[0]);
            continue;

        } else if (numberMoves > 1) {
            numberBits = Math.floor(Math.log2(numberMoves));

        } else if (numberMoves <= 0) {
            endGame = true;
            continue;
        }

        const bitsToRead = binaryArray.splice(0, numberBits);
        const moveIndex = parseInt(bitsToRead.join(''), 2);
        
        chess.move(chess.moves()[moveIndex]);
    }

    if (chess.history({ verbose: false }).length > 0) {
        chess.setHeader('Event', 'Check-MateData');
        chess.setHeader('Site', 'Local party');
        chess.setHeader('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
        chess.setHeader('Round', partyArray.length + 1 + '');
        chess.setHeader('White', 'Player');
        chess.setHeader('Black', 'Bot');
        chess.setHeader('Result', '*');

        partyArray.push(chess.pgn({ newline: '\n' }));
    }

    
    onProgress?.({
        stage: 'ENDED',
        totalBytes: binaryLength,
        remainingByte: binaryArray.length,
        remainingPercentage: 100
    });
    return partyArray
}
