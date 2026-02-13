import { useCallback, useState } from "react";
import { ChessBackground } from "./Components/ChessBackground";
import { NotificationPopup } from "./Components/NotificationPopup";
import { FileUploadCard } from "./Components/FileUploadCard";
import { TreatmentFilePGN } from "./Components/TreatmentFilePGN";
import { TreatmentFileOther } from "./Components/TreatmentFileOther";
import { Captcha } from "./Components/Captcha";

function App() {
    const [notifications, setNotifications] = useState<{ id: number; message: string; style: 'error' | 'success'; time?: number }[]>([]);
    const [file, setFile] = useState<{ file: File, type: 'PGN' | 'OTHER' } | null>(null);
    const [step, setStep] = useState<'UPLOAD' | 'CAPTCHA' | 'TREATMENT'>('UPLOAD');
    

    const addNotification = useCallback((message: string, style: 'error' | 'success' = 'error', time: number = 10) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, time, style }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((e) => e.id !== id));
    }, []);


    const onReset = () => {
        setFile(null);
        setStep('UPLOAD');
    }
    

    return (
        <>
            {/* Background */}
            <ChessBackground />


            {/* Header */}
            <div className="flex flex-col items-center flex-nowrap mt-16 lg:mt-24 absolute top-8 left-1/2 -translate-x-1/2">
                <h1 aria-label="Check-MateData" className="text-3xl sm:text-4xl lg:text-5xl w-screen text-center font-bold text-white tracking-tight mb-2">
                    <span className="noSelect mr-1.5" aria-hidden="true">♛</span>

                    Check-Mate
                    <span className="text-transparent bg-[#8355bc] bg-clip-text">
                        Data
                    </span>
                    
                    <span className="noSelect ml-1.5" aria-hidden="true">♚</span>
                </h1>
                <div className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md mx-auto text-center ">
                    Transform your files into chess games!
                </div>
            </div>


            {/* File Upload & Treatment */}
            <div 
                className={`flex flex-row transition-transform duration-500 ease-in-out delay-500 mt-36
                    ${step === 'UPLOAD' ? 
                        'translate-x-1/3' : 
                        step === 'CAPTCHA' ? 
                            'translate-x-0' : 
                            '-translate-x-1/3'
                    }
                `}
            >
                {/* Step 1 */}
                <div className="w-screen flex flex-col lg:flex-row gap-6 justify-center items-center">
                    <FileUploadCard
                        title="File to PGN"
                        description="Select a file to convert it to PGN chess game format."
                        icon="FILE"
                        onNotification={addNotification}
                        onFileSelect={(selectedFile) => {
                            setFile(selectedFile);
                            setStep('CAPTCHA');
                        }}
                    />
                    
                    <div className="hidden lg:flex flex-col items-center gap-2 px-4 relative">
                        <div className="w-px h-16 bg-linear-to-b from-transparent to-gray-600"></div>
                        <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                        </div>
                        <div className="w-px h-16 bg-linear-to-b from-gray-600 to-transparent"></div>
                    </div>

                    <div className="w-full lg:hidden relative flex flex-col items-center">
                        <div className="lg:hidden flex items-center gap-4 w-full max-w-md">
                            <div className="flex-1 h-px bg-linear-to-r from-transparent to-gray-600"></div>
                            <span className="text-[#868686] text-sm uppercase">
                                OR
                            </span>
                            <div className="flex-1 h-px bg-linear-to-r from-gray-600 to-transparent"></div>
                        </div>
                    </div>

                    <FileUploadCard 
                        title="PGN to file"
                        description="Select a PGN chess game file to convert it back to the original file."
                        icon="CHESS_FILE"
                        onNotification={addNotification}
                        onFileSelect={(selectedFile) => {
                            setFile(selectedFile);
                            setStep('CAPTCHA');
                        }}
                    />
                </div>

                {/* Step 2 */}
                <div className="w-screen flex flex-col lg:flex-row gap-6 justify-center items-center">
                    {step === 'CAPTCHA' && file && (
                        <Captcha onVerify={() => setStep("TREATMENT")} onNotification={addNotification} />
                    )}
                </div>
                
                {/* Step 3 */}
                <div className="w-screen flex flex-col lg:flex-row gap-6 justify-center items-center">
                    {step === 'TREATMENT' && file && (
                        <>
                            {file.type === 'PGN' && (
                                <TreatmentFilePGN file={file.file} onReset={onReset} onNotification={addNotification} />
                            )}
        
                            {file.type === 'OTHER' && (
                                <TreatmentFileOther file={file.file} onReset={onReset} onNotification={addNotification} />
                            )}
                        </>
                    )}
                </div>
            </div>


            {/* Notifications Popups */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification, index) => (
                    <div key={notification.id} style={{ transform: `translateY(${index * 10}px)` }}>
                        <NotificationPopup
                            message={notification.message}
                            style={notification.style}
                            time={notification.time}
                            onClose={() => removeNotification(notification.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Copy Link Button */}
            <button 
                className="opacity-50 hover:opacity-80 absolute bottom-16 right-4 cursor-pointer transition-all duration-300"
                onClick={() => {
                    addNotification("Link copied to clipboard!", "success", 5);
                    navigator.clipboard.writeText(window.location.href);
                }}
            >
                <svg className="h-9 w-auto" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 32C379.7 32 480 134.9 480 261.7C480 388.5 379.7 491.4 256 491.4C132.3 491.4 32.0001 388.5 32 261.7C32 134.9 132.3 32.0001 256 32ZM349.287 116.583C338.606 112.865 326.936 113.169 316.463 117.438C305.99 121.708 297.433 129.649 292.396 139.774C287.358 149.9 286.185 161.514 289.096 172.442L181.275 233.106C174.835 226.391 166.533 221.757 157.437 219.799C148.34 217.841 138.866 218.649 130.233 222.12C121.6 225.591 114.203 231.565 108.993 239.274C103.784 246.984 101 256.076 101 265.38C101 274.684 103.784 283.776 108.993 291.485C114.203 299.195 121.6 305.169 130.233 308.64C138.866 312.11 148.34 312.919 157.437 310.961C166.533 309.003 174.835 304.367 181.275 297.652L289.096 358.316C286.596 367.728 287.105 377.686 290.553 386.793C294 395.9 300.213 403.699 308.318 409.096C316.424 414.492 326.016 417.216 335.748 416.884C345.48 416.552 354.864 413.181 362.583 407.244C370.302 401.307 375.968 393.102 378.787 383.781C381.606 374.461 381.435 364.491 378.3 355.272C375.164 346.053 369.22 338.047 361.303 332.378C353.386 326.709 343.892 323.66 334.154 323.661C327.875 323.659 321.66 324.929 315.885 327.396C310.11 329.862 304.895 333.474 300.555 338.013L192.734 277.349C194.823 269.506 194.823 261.253 192.734 253.41L300.555 192.746C308.406 200.886 318.957 205.885 330.229 206.805C341.5 207.724 352.721 204.503 361.788 197.744C370.855 190.985 377.147 181.151 379.484 170.086C381.822 159.021 380.045 147.483 374.486 137.634C368.928 127.785 359.968 120.301 349.287 116.583Z" fill="white"/>
                </svg>
            </button>
            
            {/* GitHub Link */}
            <a 
                className="opacity-50 hover:opacity-80 absolute bottom-4 right-4 cursor-pointer transition-all duration-300"
                href="https://github.com/CapyBlaze/Check-MateData" 
                target="_blank" rel="noopener noreferrer" aria-label="Github link"
            >
                <svg className="h-9 w-auto" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M256 32C132.3 32 32 134.9 32 261.7C32 363.2 96.2 449.2 185.2 479.6C186.448 479.871 187.723 480.005 189 480C197.3 480 200.5 473.9 200.5 468.6C200.5 463.1 200.3 448.7 200.2 429.5C192.79 431.237 185.21 432.143 177.6 432.2C134.5 432.2 124.7 398.7 124.7 398.7C114.5 372.2 99.8 365.1 99.8 365.1C80.3 351.4 99.7 351 101.2 351H101.3C123.8 353 135.6 374.8 135.6 374.8C146.8 394.4 161.8 399.9 175.2 399.9C184.06 399.723 192.784 397.678 200.8 393.9C202.8 379.1 208.6 369 215 363.2C165.3 357.4 113 337.7 113 249.7C113 224.6 121.7 204.1 136 188.1C133.7 182.3 126 158.9 138.2 127.3C139.836 126.908 141.518 126.74 143.2 126.8C151.3 126.8 169.6 129.9 199.8 150.9C236.495 140.633 275.305 140.633 312 150.9C342.2 129.9 360.5 126.8 368.6 126.8C370.282 126.74 371.964 126.908 373.6 127.3C385.8 158.9 378.1 182.3 375.8 188.1C390.1 204.2 398.8 224.7 398.8 249.7C398.8 337.9 346.4 357.3 296.5 363C304.5 370.1 311.7 384.1 311.7 405.5C311.7 436.2 311.4 461 311.4 468.5C311.4 473.9 314.5 480 322.8 480C324.144 480.006 325.484 479.872 326.8 479.6C415.9 449.2 480 363.1 480 261.7C480 134.9 379.7 32 256 32Z" fill="white"/>
                </svg>
            </a>
        </>
    )
}

export default App
