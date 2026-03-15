import React from 'react';

interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
    className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
    data,
    color = "#3b82f6", // default blue-500
    width = 100,
    height = 30,
    className
}) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Calculate points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className={className} overflow="visible">
            <path
                d={`M ${points}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
