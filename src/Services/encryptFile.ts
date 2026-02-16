/* import { gzipSync } from 'fflate'; */
import { Chess } from "chess.js";


export interface EncryptionProgress {
    stage?: 'COMPRESSING' | 'ENCODING' | 'ENDED';
    totalBytes?: number;
    remainingByte?: number;
    remainingPercentage?: number;
    encodingInfo?: {
        numberMatches: number;
        numberMoves: number;
        numberMatchesNull: number;
        numberMatchesBlack: number;
        numberMatchesWhite: number;
    }
}


function setChessHeader(chess: Chess, fileExtension: string = 'bin') {
    chess.setHeader('Event', 'Check-MateData');
    chess.setHeader('Site', 'Web party');
    chess.setHeader('Date', new Date().toISOString().split('T')[0].replace(/-/g, '.'));
    chess.setHeader('White', 'Player');
    chess.setHeader('Black', fileExtension.toUpperCase() + ' File');
    chess.setHeader('Time', new Date().toLocaleTimeString());
}


export async function encryptFile(
    file: File,
    onProgress?: (output: EncryptionProgress) => void

): Promise<string[]> {
    onProgress?.({
        stage: 'COMPRESSING',
        remainingPercentage: 0
    })


    let dataFile: Uint8Array;
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Input = new Uint8Array(arrayBuffer);

        /*const compressed = gzipSync(uint8Input, { level: 9, mem: 12 });
        
        if (compressed.length < uint8Input.length) dataFile = compressed;
        else                                    */ dataFile = uint8Input;

    } catch {
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

    const encodingInfo: EncryptionProgress['encodingInfo'] = {
        numberMatches: 0,
        numberMoves: 0,
        numberMatchesNull: 0,
        numberMatchesBlack: 0,
        numberMatchesWhite: 0,
    };


    while (binaryArray.length > 0) {
        onProgress?.({
            stage: 'ENCODING',
            totalBytes: binaryLength,
            remainingByte: binaryArray.length,
            remainingPercentage: 100 - ((binaryArray.length / binaryLength) * 100)
        });
        

        if (chess.isGameOver() || endGame) {
            setChessHeader(chess, file.name.split('.').pop());
            chess.setHeader('Round', partyArray.length + 1 + '');
            
            if (chess.isDraw() || chess.isStalemate()) {
                chess.setHeader('Result', '1/2-1/2');

            } else if (chess.isCheckmate()) {
                if (chess.turn() === 'w') {
                    chess.setHeader('Result', '0-1');
                    encodingInfo.numberMatchesBlack++;

                } else {
                    chess.setHeader('Result', '1-0');
                    encodingInfo.numberMatchesWhite++;
                }
            
            } else {
                chess.setHeader('Result', '*');
                encodingInfo.numberMatchesNull++;
            }

            partyArray.push(chess.pgn({ newline: '\n' }));
            partyArray[partyArray.length - 1] += "\n";

            chess.reset();
            encodingInfo.numberMatches++;

            endGame = false;
        }


        const movesList = chess.moves();
        const numberMoves = movesList.length;
        let numberBits;
        if (numberMoves == 1) {
            chess.move(movesList[0]);
            encodingInfo.numberMoves++;
            continue;

        } else if (numberMoves > 1) {
            numberBits = Math.floor(Math.log2(numberMoves));

        } else if (numberMoves <= 0) {
            endGame = true;
            continue;
        }

        const bitsToRead = binaryArray.splice(0, numberBits);
        const moveIndex = parseInt(bitsToRead.join(''), 2);
        
        chess.move(movesList[moveIndex]);
        encodingInfo.numberMoves++;
    }

    if (chess.history({ verbose: false }).length > 0) {
        setChessHeader(chess, file.name.split('.').pop());
        chess.setHeader('Round', partyArray.length + 1 + '');
        chess.setHeader('Result', '*');

        partyArray.push(chess.pgn({ newline: '\n' }));

        encodingInfo.numberMatches++;
    }

    
    onProgress?.({
        stage: 'ENDED',
        totalBytes: binaryLength,
        remainingByte: binaryArray.length,
        remainingPercentage: 100,
        encodingInfo: encodingInfo
    });
    return partyArray
}
