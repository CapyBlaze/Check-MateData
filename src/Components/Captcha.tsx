import { Chess, type Square } from 'chess.js';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';


export function Captcha({ 
    onVerify, 
    onNotification 
}: { 
    onVerify?: (success: boolean) => void, 
    onNotification?: (message: string, style: 'error' | 'success', time?: number) => void;
}): JSX.Element {
    const submitButtonRef = useRef<HTMLButtonElement>(null);
    const captchaRef = useRef<HTMLDivElement>(null);
    const hasChecked = useRef(false);

    const [refreshKey, setRefreshKey] = useState(0);
    const [captchaStep, setCaptchaStep] = useState<number>(0);

    
    const gameModel = useMemo(() => new Chess("r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/2N5/PPPP1PPP/R1BQK1NR w KQkq - 0 1"), []);
    const gameChess = useMemo(() => new Chess(), []);



    const reloadCaptcha = () => {
        gameChess.reset();
        setRefreshKey(prev => prev + 1);
    }
    
    const verifyCaptcha = () => {
        if (gameChess.fen().split(' ')[0] === gameModel.fen().split(' ')[0]) {
            setCaptchaStep(2);

            const expiration = Date.now() + 10 * 60 * 1000;
            const data = {
                isValid: true,
                expiresAt: expiration
            };
            sessionStorage.setItem('captcha_patience', JSON.stringify(data));

            onNotification?.('Captcha solved successfully!', 'success', 5);


            const timerStep2 = setTimeout(() => {
                onVerify?.(true);
            }, 1000);

            return () => clearTimeout(timerStep2);

        } else {
            onNotification?.('Captcha verification failed. Please try again.', 'error', 5);
        }
    }


    useEffect(() => {
        if (captchaStep !== 1 || hasChecked.current) return;

        const timer = setTimeout(() => {
            const rawData = sessionStorage.getItem('captcha_patience');
            if (rawData) {
                const data = JSON.parse(rawData);

                if (Date.now() > data.expiresAt) {
                    onNotification?.('Your patience has expired, please renew it.', 'error', 5);
                    sessionStorage.removeItem('captcha_patience');
                    hasChecked.current = true;
                    captchaRef.current?.classList.add('scale-100');
                    return;
                } 
                
                if (data.isValid) {
                    setCaptchaStep(2);
                    onNotification?.('Captcha already solved!', 'success', 5);
                    hasChecked.current = true;

                    const timerStep2 = setTimeout(() => {
                        onVerify?.(true);
                    }, 1000);

                    return () => clearTimeout(timerStep2);
                }
            }

            hasChecked.current = true;

            captchaRef.current?.classList.add('scale-100');
        }, 1500);

        return () => clearTimeout(timer);

    }, [captchaStep, onNotification, onVerify]);
    

    return (
        <>
            {/* CAPTCHA Checkbox */}
            <div className="glass m-3 border border-[#4b5563] rounded-sm p-4 flex items-center gap-8">
                <div className="flex flex-row gap-4 items-center">
                    {/* Checkbox */}
                    {captchaStep === 0 && (
                        <input type="checkbox" name="notImpatientCheckbox" id="notImpatientCheckbox"
                            onChange={(e) => {
                                if (e.target.checked) {
                                    e.target.disabled = true; 
                                    setCaptchaStep(1);
                                }
                            }}
                        />
                    )}

                    {/* Loading */}
                    {captchaStep === 1 && (
                        <div>
                            <svg className="animate-spin h-7 w-7 text-gray-500" viewBox="0 0 109 108" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path stroke="#8d8d8d" d="M104.5 54.5C104.5 45.2064 101.91 36.0967 97.0201 28.1933C92.1304 20.29 85.1348 13.9059 76.8184 9.75751C68.5019 5.60914 59.1939 3.86072 49.939 4.70849C40.6841 5.55625 31.8487 8.96666 24.4243 14.5569C17 20.1472 11.2806 27.696 7.90817 36.3562C4.53572 45.0163 3.64366 54.445 5.33213 63.584C7.02059 72.723 11.2228 81.2105 17.4669 88.094C23.7111 94.9774 31.7502 99.9843 40.6819 102.553" strokeWidth="9" strokeLinecap="round"/>
                            </svg>
                        </div>
                    )}

                    {/* Checked */}
                    {captchaStep === 2 && (
                        <div className='-scale-x-100'>
                            <svg className="h-7 w-7 text-gray-500" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M112 184L256 328L400 184" stroke="#2ca50e" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}

                    <p>I'm not impatient</p>
                </div>

                <div className="h-9 w-9">
                    <svg className="h-9 w-9" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M34.4716 65H0.00778261V118L14.0832 104.054C20.4131 111.942 28.5705 118.277 37.9412 122.455C52.0333 128.737 67.9206 129.717 82.6779 125.214C95.3374 121.351 106.434 113.677 114.5 103.316L89.046 79.6725C85.2677 85.7105 79.4353 90.1804 72.6226 92.2591C65.8099 94.3378 58.4756 93.8855 51.97 90.9853C46.5199 88.5557 41.9588 84.5451 38.8539 79.5114L53.5 65H34.4716Z" fill="#A5A5A5"/>
                        <path d="M0.00778261 65H34.4716C34.3677 61.9326 34.7415 58.844 35.6018 55.8472C37.5672 49.001 41.9398 43.0953 47.9143 39.2174C48.0414 39.1349 48.1691 39.0534 48.2973 38.973L63.5 54V34.4588V0.00179815L63.0246 0.0072776L9.5 0.624251L23.49 14.4525C13.4497 22.6612 6.09387 33.7685 2.48483 46.3398C0.730207 52.4516 -0.0901335 58.7398 0.00778261 65Z" fill="#A072D0"/>
                        <path d="M63.5 0.00179815V34.4588C65.0355 34.4328 66.5789 34.5265 68.1165 34.7428C75.1698 35.7353 81.6272 39.2423 86.2997 44.6183C87.3085 45.779 88.2196 47.0101 89.0279 48.2986L72.9171 64H93.5453H128V10.3168L113.96 24C113.423 23.3288 112.871 22.6673 112.305 22.016C102.183 10.3708 88.1956 2.77397 72.9171 0.624251C69.7809 0.182978 66.6336 -0.0226791 63.5 0.00179815Z" fill="#653894"/>
                        <g clipPath="url(#clip0_273_1771)">
                            <path d="M42.0554 91.3949H86.7357C86.7357 91.3949 89.7909 90.7859 89.7909 87.7458C89.7909 83.1847 85.6444 81.5208 83.6803 78.9264C75.3874 68.3981 75.9914 42.7617 75.9914 42.7617H52.7995C52.7995 42.7617 53.4038 68.3981 45.1068 78.9264C43.1464 81.5208 39 83.1847 39 87.7458C39 90.7859 42.0554 91.3949 42.0554 91.3949Z" fill="white"/>
                            <path d="M76.0849 39.3965L83.3217 34.8171V22H74.6701V28.9587H68.5595V22H60.4147V28.9587H54.3078V22H45.6523V34.8171L52.8931 39.3965H76.0849Z" fill="white"/>
                            <path d="M42.045 94.7598L39.5547 99.0017V104.494H89.2155V99.0017L86.7253 94.7598H42.045Z" fill="white"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_273_1771">
                                <rect width="51" height="83" fill="white" transform="translate(39 22)"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>



            {/* CAPTCHA Verification */}
            {captchaStep === 1 && createPortal(
                <div ref={captchaRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out z-10 scale-0 overflow-hidden rounded-md" draggable="false">
                    <div className="bg-[#422e5e] p-4 flex flex-row justify-between items-center gap-5">
                        <div>
                            <h1 className="text-white font-bold text-lg sm:text-xl lg:text-2xl">Verify that you have the patience</h1>
                            <p className="text-white text-sm sm:text-base lg:text-lg">Replicate the chessboard pattern from left to right to solve the puzzle.</p>
                        </div>

                        <div className="h-10 w-10 sm:h-14 sm:w-14">
                            <svg className="h-10 w-10 sm:h-14 sm:w-14" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M34.4716 65H0.00778261V118L14.0832 104.054C20.4131 111.942 28.5705 118.277 37.9412 122.455C52.0333 128.737 67.9206 129.717 82.6779 125.214C95.3374 121.351 106.434 113.677 114.5 103.316L89.046 79.6725C85.2677 85.7105 79.4353 90.1804 72.6226 92.2591C65.8099 94.3378 58.4756 93.8855 51.97 90.9853C46.5199 88.5557 41.9588 84.5451 38.8539 79.5114L53.5 65H34.4716Z" fill="#A5A5A5"/>
                                <path d="M0.00778261 65H34.4716C34.3677 61.9326 34.7415 58.844 35.6018 55.8472C37.5672 49.001 41.9398 43.0953 47.9143 39.2174C48.0414 39.1349 48.1691 39.0534 48.2973 38.973L63.5 54V34.4588V0.00179815L63.0246 0.0072776L9.5 0.624251L23.49 14.4525C13.4497 22.6612 6.09387 33.7685 2.48483 46.3398C0.730207 52.4516 -0.0901335 58.7398 0.00778261 65Z" fill="#A072D0"/>
                                <path d="M63.5 0.00179815V34.4588C65.0355 34.4328 66.5789 34.5265 68.1165 34.7428C75.1698 35.7353 81.6272 39.2423 86.2997 44.6183C87.3085 45.779 88.2196 47.0101 89.0279 48.2986L72.9171 64H93.5453H128V10.3168L113.96 24C113.423 23.3288 112.871 22.6673 112.305 22.016C102.183 10.3708 88.1956 2.77397 72.9171 0.624251C69.7809 0.182978 66.6336 -0.0226791 63.5 0.00179815Z" fill="#653894"/>
                                <g clipPath="url(#clip0_273_1771)">
                                    <path d="M42.0554 91.3949H86.7357C86.7357 91.3949 89.7909 90.7859 89.7909 87.7458C89.7909 83.1847 85.6444 81.5208 83.6803 78.9264C75.3874 68.3981 75.9914 42.7617 75.9914 42.7617H52.7995C52.7995 42.7617 53.4038 68.3981 45.1068 78.9264C43.1464 81.5208 39 83.1847 39 87.7458C39 90.7859 42.0554 91.3949 42.0554 91.3949Z" fill="white"/>
                                    <path d="M76.0849 39.3965L83.3217 34.8171V22H74.6701V28.9587H68.5595V22H60.4147V28.9587H54.3078V22H45.6523V34.8171L52.8931 39.3965H76.0849Z" fill="white"/>
                                    <path d="M42.045 94.7598L39.5547 99.0017V104.494H89.2155V99.0017L86.7253 94.7598H42.045Z" fill="white"/>
                                </g>
                                <defs>
                                    <clipPath id="clip0_273_1771">
                                        <rect width="51" height="83" fill="white" transform="translate(39 22)"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    <div className="bg-[#252328] p-4 pb-2 overflow-y-scroll lg:overflow-y-auto max-h-100 lg:max-h-max flex flex-col items-center">
                        <div className="flex flex-col lg:flex-row flex-nowrap gap-8">
                            <RenderChessBoard key={`model-${refreshKey}`} game={gameModel} isModel={true} />

                            <RenderChessBoard key={`game-${refreshKey}`} game={gameChess} className="cursor-pointer" />
                        </div>
                    </div>
                    
                    <div className="bg-[#252328] p-4 pt-2">
                        <div className="h-px bg-[#EDEDED] opacity-50 rounded-2xl mb-2.5" />
                        
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row gap-2">
                                {/* Reload */}
                                <button className="cursor-pointer flex items-center justify-center opacity-70 hover:opacity-90 transition" aria-label="Reload Captcha"
                                    onClick={reloadCaptcha}
                                >
                                    <svg width="24px" height="24px" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M400 148L378.88 123.43C360.973 104.622 339.426 89.6537 315.55 79.4368C291.674 69.2199 265.97 63.9678 240 64.0001C134 64.0001 48 150 48 256C48 362 134 448 240 448C279.71 447.997 318.443 435.688 350.87 412.766C383.296 389.843 407.821 357.435 421.07 320" stroke="white" strokeWidth="32" strokeMiterlimit="10" strokeLinecap="round"/>
                                        <path d="M464 97.4202V208C464 212.244 462.314 216.313 459.314 219.314C456.313 222.314 452.244 224 448 224H337.42C323.16 224 316.02 206.77 326.1 196.69L436.69 86.1002C446.77 76.0002 464 83.1602 464 97.4202Z" fill="white"/>
                                    </svg>
                                </button>

                                {/* Help */}
                                <button className="cursor-pointer flex items-center justify-center opacity-70 hover:opacity-90 transition" aria-label="Help with Captcha"
                                    onClick={() => window.open('https://en.wikipedia.org/wiki/Rules_of_chess', '_blank')}
                                >
                                    <svg width="24px" height="24px" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M248 64C146.39 64 64 146.39 64 248C64 349.61 146.39 432 248 432C349.61 432 432 349.61 432 248C432 146.39 349.61 64 248 64Z" stroke="white" strokeWidth="32" strokeMiterlimit="10"/>
                                        <path d="M220 220H252V336" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M208 340H296" stroke="white" strokeWidth="32" strokeMiterlimit="10" strokeLinecap="round"/>
                                        <path d="M248 130C242.858 130 237.831 131.525 233.555 134.382C229.28 137.239 225.947 141.299 223.979 146.05C222.011 150.801 221.496 156.029 222.5 161.072C223.503 166.116 225.979 170.749 229.615 174.385C233.251 178.021 237.884 180.497 242.928 181.5C247.971 182.504 253.199 181.989 257.95 180.021C262.701 178.053 266.761 174.721 269.618 170.445C272.475 166.169 274 161.142 274 156C274 149.104 271.261 142.491 266.385 137.615C261.509 132.739 254.896 130 248 130Z" fill="white"/>
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Submit */}
                            <button ref={submitButtonRef} className="bg-[#653894] text-white px-6 py-1.5 rounded cursor-pointer" aria-label="Submit Captcha"
                                onClick={verifyCaptcha}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>,
                document.getElementById('root') || document.body
            )}
        </>
    )
}



function RenderChessBoard({ game, isModel, className }: { game: Chess, isModel?: boolean, className?: string }): JSX.Element {
    const [fen, setFen] = useState(game.fen());
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
    const [caseSelected, setCaseSelected] = useState<Square | null>(null);
    const [endGameMessage, setEndGameMessage] = useState('');


    const boardState = useMemo(() => {
        const rows = fen.split(' ')[0].split('/');
        const grid = [];

        for (const rowStr of rows) {
            const row = [];
            for (const char of rowStr) {
                if (isNaN(parseInt(char))) {
                    row.push({
                        color: char === char.toUpperCase() ? 'lt' : 'dt',
                        type: char.toLowerCase()
                    });

                } else {
                    for (let i = 0; i < parseInt(char); i++) row.push(null);
                }
            }
            grid.push(row);
        }
        return grid;
    }, [fen]);

    const selectPiece = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isModel) return;
        const target = e.currentTarget;

        if (possibleMoves.includes(target.id as Square)) {
            game.move({ from: caseSelected!, to: target.id as Square });
            setCaseSelected(null);
            setPossibleMoves([]);
            setFen(game.fen());

            if (game.isCheckmate())      setEndGameMessage('Checkmate!');
            else if (game.isStalemate()) setEndGameMessage('Stalemate!');
            else if (game.isDraw())      setEndGameMessage('Draw!');
            else if (game.isGameOver())  setEndGameMessage('Game Over!');

            return;
        }

        if (game.turn() === game.get(target.id as Square)?.color) {
            setCaseSelected(target.id as Square);

            const moves = game.moves({ 
                square: target.id as Square, 
                verbose: true 
            });
            
            setPossibleMoves(moves.map(m => m.to));

        } else {
            setCaseSelected(null);
            setPossibleMoves([]);
        }
    };


    return (
        <div draggable="false" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }} className={`noDrag relative rounded-lg overflow-hidden w-[calc(32px * 8)] sm:w-[calc(40px * 8)] lg:w-[calc(48px * 8)] ${className}`}>
            {boardState.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                    <div 
                        key={`${isModel ? 'model-' : ''}${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`} 
                        id={`${isModel ? 'model-' : ''}${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`} 
                        className={`
                            ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'} 
                            w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 relative flex items-center justify-center
                            ${!isModel && possibleMoves.includes(
                                `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square
                            ) ? 'selectableSquareChessboard' : ''}
                        `}
                        style={{
                            backgroundColor:
                                caseSelected === `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` ? 
                                    (rowIndex + colIndex) % 2 === 0 ? '#AE90D5' : '#9263B5' : 
                                    (rowIndex + colIndex) % 2 === 0 ? '#F0D9B5' : '#B58863'
                        }}
                        onClick={selectPiece}
                    >
                        {/* Chess Piece */}
                        {cell && (
                            <img 
                            draggable="false" 
                            src={`/check-matedata/Chess_${cell.type}${cell.color}45.svg`} 
                            alt={cell.type} 
                            className='z-50 noSelect'
                            />
                        )}

                        {/* Possible Moves */}
                        {!isModel && possibleMoves.includes(`${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square) && (
                            <>
                                {game.get(`${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` as Square) !== undefined ? (
                                    <svg viewBox="0 0 24 24" className="w-full h-full absolute z-10">
                                        <g clipPath="url(#clip0_255_1694)">
                                            <path d="M0 17.0078C1.31707 20.1602 3.83983 22.6829 6.99219 24H0V17.0078ZM24 24H17.0078C20.1602 22.6829 22.6829 20.1602 24 17.0078V24ZM6.99219 0C3.84011 1.31695 1.31716 3.83925 0 6.99121V0H6.99219ZM24 6.99121C22.6828 3.83925 20.1599 1.31695 17.0078 0H24V6.99121Z" fill="#5C55FD80"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_255_1694">
                                                <rect width="24" height="24" fill="white"/>
                                            </clipPath>
                                        </defs>
                                    </svg>

                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 512 512" className="absolute z-10">
                                        <ellipse cx="256" cy="256" rx="200" ry="200" fill="#75599AE0"/>
                                    </svg>
                                )}
                            </>
                        )}

                        {/* Row Labels */}
                        {colIndex === 0 && (
                            <span
                                className="absolute top-0 left-0 font-bold text-xs mx-1 my-0.5 noSelect z-10"
                                style={{
                                    color: 
                                        caseSelected === `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` ?
                                        '#F0D9B5' :
                                        (rowIndex + colIndex) % 2 === 0 ? '#B58863' : '#F0D9B5'
                                }}
                                aria-hidden="true"
                            >
                                {8 - rowIndex}
                            </span>
                        )}

                        {/* Column Labels */}
                        {rowIndex === 7 && (
                            <span
                                className="absolute bottom-0 right-0 font-bold text-xs mx-1 my-0.5 noSelect z-10"
                                style={{
                                    color: 
                                        caseSelected === `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}` ?
                                        '#F0D9B5' :
                                        (rowIndex + colIndex) % 2 === 0 ? '#B58863' : '#F0D9B5'
                                }}
                                aria-hidden="true"
                            >
                                {String.fromCharCode(97 + colIndex)}
                            </span>
                        )}
                    </div>
                ))
            )}

            {endGameMessage !== '' && (
                <p className='absolute w-75 text-[#e8e8e8] bg-[#000000e0] p-2.5 rounded-lg z-50 text-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold'>
                    {endGameMessage}
                </p>
            )}
        </div>
    );
}