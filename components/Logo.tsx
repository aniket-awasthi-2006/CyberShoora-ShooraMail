
import React from 'react';

// Use any for style prop to avoid CSSProperties typing restrictions on SVG-specific properties like fill
export const LogoBlack = ({ className = "w-8 h-8", style }: { className?: string; style?: any }) => (
  <svg viewBox="0 0 1658 1578" className={`${className} transition-all duration-700`} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1101.59 473H1133C1422.95 473 1658 708.051 1658 998V1053C1658 1342.95 1422.95 1578 1133 1578H0L555.111 1106.1L1135 784L421.5 395.235L580.5 784L376.759 1076.46C157.78 1003.04 0 796.199 0 552.5C0 248.86 244.941 2.43047 548.013 0.0195312L548 0H1658L1101.59 473Z" fill={style?.fill || "black"} className="transition-all duration-700" />
  </svg>
);

// Use any for style prop to avoid CSSProperties typing restrictions on SVG-specific properties like fill
export const LogoWhite = ({ className = "w-8 h-8", style }: { className?: string; style?: any }) => (
  <svg viewBox="0 0 1658 1578" className={`${className} transition-all duration-700`} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1101.59 473H1133C1422.95 473 1658 708.051 1658 998V1053C1658 1342.95 1422.95 1578 1133 1578H0L555.111 1106.1L1135 784L421.5 395.235L580.5 784L376.759 1076.46C157.78 1003.04 0 796.199 0 552.5C0 248.86 244.941 2.43047 548.013 0.0195312L548 0H1658L1101.59 473Z" fill={style?.fill || "white"} className="transition-all duration-700" />
  </svg>
);
