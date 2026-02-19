import { Chess } from "chess.js";


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


    const games: string[] = [];
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


    
    let finalBigInt = 0n;
    const chess = new Chess();
    const chessTemp = new Chess();

    for (let i = games.length - 1; i >= 0; i--) {
        chess.loadPgn(games[i]);
        chessTemp.reset();


        const matchMoveData: { n: bigint, index: number }[] = [];
        
        for (const move of chess.history()) {
            const movesList = chessTemp.moves();
            const n = BigInt(movesList.length);
            const moveIndex = movesList.indexOf(move);

            if (moveIndex === -1) {
                throw new Error(`Move invalide : ${move}`);
            }

            if (n > 1n) {
                matchMoveData.push({ n, index: moveIndex });
            }

            chessTemp.move(move);
            encodingInfo.numberMoves++;
        }

        encodingInfo.numberMatches++;



        for (let j = matchMoveData.length - 1; j >= 0; j--) {
            const { n, index } = matchMoveData[j];
            finalBigInt = (finalBigInt * n) + BigInt(index);
        }

        onProgress?.({
            stage: 'DECODING',
            remainingPercentage: ((games.length - i) / games.length) * 100
        });
    }



    // END 
    let hex = finalBigInt.toString(16);
    if (hex.length % 2 !== 0) hex = '0' + hex;

    const byteArray = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const finalData = byteArray.slice(1);


    let fileName = files[0].name
    fileName = fileName.includes('_') ? fileName.split('_').slice(1).join('_') : fileName; // Remove prefix counter
    fileName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName; // Remove extension
    fileName += chess.getHeaders().Black ? `.${chess.getHeaders().Black.toLowerCase().split(' ')[0]}` : '.bin'; // Add extension based on header or default to .bin



    onProgress?.({
        stage: 'ENDED',
        remainingPercentage: 100,
        encodingInfo: encodingInfo
    });


    return new File(
        [finalData.buffer], 
        fileName || "decrypted_file",
        { type: 'application/octet-stream' }
    );
}