import { createPortal } from 'react-dom';

export function Save({ 
    onClose
}: {
    onClose: () => void 
}) {

    return (
        <>
            {createPortal(
                <div className="absolute w-full h-full sm:h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-100 max-w-2xl mx-auto p-6 glass rounded-t-xl border-2 border-[#ffffff11] bg-slate-900 text-slate-100 rounded-xl shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <div className='noSelect chess-piece-static'>♞</div>
                        How to save your PGN files
                    </h2>

                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <p className="text-lg font-semibold">Create a collection</p>
                                <p className="text-slate-400">
                                    Go to your <a href="https://www.chess.com/analysis/collections" target="_blank" className="text-green-500 hover:underline">Chess.com Collections</a> and click on the <span className="bg-green-600 text-white px-2 py-0.5 rounded text-sm font-bold uppercase tracking-wide">New</span> button.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <p className="text-lg font-semibold">Configuration</p>
                                <p className="text-slate-400">Enter a name for your collection in the "<span className='text-green-500'>Collection Name</span>" field.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4">
                            <div className="flex-none w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold">3</div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold mb-3">Loading files</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Case ZIP */}
                                    <div className="p-4 bg-slate-800 border-l-4 border-blue-500 rounded">
                                        <h4 className="font-bold text-blue-400 mb-1">Format ZIP</h4>
                                        <p className="text-sm text-slate-300">
                                            First unzip the archive on your computer, then import <span className="font-mono text-white">all the extracted .pgn files</span> one by one.
                                        </p>
                                    </div>

                                    {/* Case Unique File */}
                                    <div className="p-4 bg-slate-800 border-l-4 border-green-500 rounded">
                                        <h4 className="font-bold text-green-400 mb-1">Single File</h4>
                                        <p className="text-sm text-slate-300">
                                            Simply drag and drop your <span className="font-mono text-white">.pgn</span> file directly into the upload area.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        className='absolute top-0 right-0 w-9 h-9 m-2 opacity-60 hover:opacity-80 cursor-pointer' 
                        aria-label='close windows'
                        onClick={() => {
                            onClose();
                        }}
                    >
                        <svg className="w-9 h-9" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M368 368L144 144" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M368 144L144 368" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>, 
                document.getElementById('root') || document.body
            )}
        </>
    );

}