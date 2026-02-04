import { Chess } from "chess.js";



export interface DecryptionProgress {
    stage?: 'DECODING' | 'ENDED';
    remainingPercentage?: number;
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
    const dataResultFile: string[] = [];

    for (const file of files) {
        const fileContent = await file.text();
        games.push(...fileContent.split(/\n+(?=\[Event ")/g));
    }

    
    for (let i = 0; i < games.length; i++) {
        chess.loadPgn(games[i]);
        chessTemp.reset();

        for (const move of chess.history()) {
            const movesList = chessTemp.moves();
            const numberMoves = chessTemp.moves().length;
            
            if (numberMoves > 1) {
                const numberBits = Math.floor(Math.log2(numberMoves));
                const moveIndex = movesList.indexOf(move);

                if (moveIndex !== -1 && moveIndex < Math.pow(2, numberBits)) {
                    dataResultFile.push(
                        moveIndex.toString(2).padStart(numberBits, '0')
                    );
                }

            }

            chessTemp.move(move);
        }
        

        onProgress?.({
            stage: 'DECODING',
            remainingPercentage: (i / games.length) * 100
        });
    }



    onProgress?.({
        stage: 'ENDED',
        remainingPercentage: 100
    });

 
    // TRANSFORMATION STRING (BINAIRE) EN UN FICHIER

    return new File(
        [dataResultFile.join("")], 
        files[0].name
            .split('.').slice(0, -1).join('.')
            .split('_').slice(1).join('_') || 
            "decrypted_file"
    );
}