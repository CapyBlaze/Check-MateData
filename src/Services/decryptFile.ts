import { Chess } from "chess.js";
import { BitBuilder } from "../Utils/BitBuilder";


export interface DecryptionProgress {
    stage?: 'DECODING' | 'ENDED';
    remainingPercentage?: number;
    encodingInfo?: {
        numberMatches: number;
        numberMoves: number;
    }
}


export async function decryptFile(
    files: File[],
    onProgress?: (output: DecryptionProgress) => void

): Promise<File> {
    if (files.length === 0) throw new Error("No files to decrypt.");

    onProgress?.({
        stage: 'DECODING',
        remainingPercentage: 0
    })


    const chess = new Chess()
    const chessTemp = new Chess();
    const games: string[] = [];
    const bitBuilderInstance = new BitBuilder();

    const encodingInfo: DecryptionProgress['encodingInfo'] = {
        numberMatches: 0,
        numberMoves: 0,
    };


    for (const file of files) {
        const fileContent = await file.text();
        const splitGames = fileContent
            .split(/\n+(?=\[Event ")/g)
            .map(game => game.trim())
            .filter(Boolean);

        games.push(...splitGames);
    }

    if (games.length === 0) {
        throw new Error("No games found in PGN files.");
    }

    
    for (let i = 0; i < games.length; i++) {
        chess.loadPgn(games[i]);
        chessTemp.reset();

        for (const move of chess.history()) {
            const movesList = chessTemp.moves();
            const numberMoves = movesList.length;
            
            if (numberMoves > 1) {
                const numberBits = Math.floor(Math.log2(numberMoves));
                const moveIndex = movesList.indexOf(move);

                if (moveIndex !== -1 && moveIndex < Math.pow(2, numberBits)) {
                    bitBuilderInstance.pushString(
                        moveIndex.toString(2).padStart(numberBits, '0')
                    );
                }

            }

            chessTemp.move(move);
            encodingInfo.numberMoves++;
        }
        
        encodingInfo.numberMatches++;

        onProgress?.({
            stage: 'DECODING',
            remainingPercentage: ((i + 1) / games.length) * 100
        });
    }


    onProgress?.({
        stage: 'ENDED',
        remainingPercentage: 100,
        encodingInfo: encodingInfo
    });

    const fileName = files[0].name.split('.').slice(0, -1).join('.') // Remove extension
    const finalName = fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName; // Remove prefix counter

    return new File(
        [bitBuilderInstance.getUint8Array().buffer as ArrayBuffer], 
        finalName || "decrypted_file",
        { type: 'application/octet-stream' }
    );
}