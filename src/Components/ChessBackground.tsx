import { useEffect, useState } from 'react';

const chessPieces = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];

interface FallingPiece {
    id: number;
    piece: string;
    left: number;
    duration: number;
    delay: number;
    size: number;
    opacity: number;
}

export function ChessBackground() {
    const [pieces, setPieces] = useState<FallingPiece[]>([]);

    useEffect(() => {
        const generatePieces = () => {
            const newPieces: FallingPiece[] = [];
            for (let i = 0; i < 30; i++) {
                newPieces.push({
                    id: i,
                    piece: chessPieces[Math.floor(Math.random() * chessPieces.length)],
                    left: Math.random() * 100,
                    duration: 8 + Math.random() * 12,
                    delay: Math.random() * 10,
                    size: 20 + Math.random() * 40,
                    opacity: 0.1 + Math.random() * 0.3,
                });
            }
            setPieces(newPieces);
        };

        generatePieces();
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-bg-start via-bg-middle to-bg-end" />

            {/* Falling chess pieces */}
            {pieces.map((piece) => (
                <span
                    key={piece.id}
                    className="chess-piece text-white/20"
                    style={{
                        left: `${piece.left}%`,
                        fontSize: `${piece.size}px`,
                        animationDuration: `${piece.duration}s`,
                        animationDelay: `${piece.delay}s`,
                        opacity: piece.opacity,
                    }}
                >
                    {piece.piece}
                </span>
            ))}

            
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    );
}
