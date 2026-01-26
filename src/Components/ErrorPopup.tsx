import { useEffect, useState } from 'react';

interface ErrorPopupProps {
    message: string;
    onClose: () => void;
}

export function ErrorPopup({ message, onClose }: ErrorPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);

        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    
    return (
        <div
            className={`
                fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out 
                ${isVisible && !isLeaving
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }
            `}
        >
            <div className="glass rounded-xl p-4 pr-12 max-w-sm border border-red-500/30 shadow-2xl"
                style={{ boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)' }}
            >
                <div className="flex items-start gap-3">
                    {/* Error icon */}
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className='w-52'>
                        <h4 className="text-white font-semibold text-sm">Erreur</h4>
                        <p className="text-gray-400 text-sm mt-0.5">{message}</p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Progress bar for auto-close */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-2xl overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-red-500 to-rose-600 rounded-b-2xl"
                        style={{
                            animation: 'shrink 5s linear forwards',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
