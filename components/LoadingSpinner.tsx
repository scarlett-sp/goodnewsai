export default function LoadingSpinner() {
  return (
    <div className="flex items-center gap-1">
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1); opacity: 1; }
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: dot-pulse 1.4s infinite;
        }

        .dot-1 { background-color: #FF8E7E; animation-delay: 0s; }
        .dot-2 { background-color: #FFB89C; animation-delay: 0.2s; }
        .dot-3 { background-color: #C3E3F4; animation-delay: 0.4s; }
        .dot-4 { background-color: #3FA8F0; animation-delay: 0.6s; }
        .dot-5 { background-color: #FFA0B4; animation-delay: 0.8s; }
      `}</style>
      <div className="dot dot-1"></div>
      <div className="dot dot-2"></div>
      <div className="dot dot-3"></div>
      <div className="dot dot-4"></div>
      <div className="dot dot-5"></div>
    </div>
  );
}
