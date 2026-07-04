// Chuỗi đèn lồng treo — điểm nhấn thị giác riêng cho thương hiệu Hội An Travel
// Không dùng ảnh stock, vẽ thuần SVG để nhẹ và tuỳ biến màu theo theme.
export default function LanternRow({ count = 7 }) {
  const lanterns = Array.from({ length: count });
  const colors = ["#D64550", "#B94E2C", "#E3A94D"];

  return (
    <svg
      viewBox={`0 0 ${count * 90} 170`}
      style={{ width: "100%", height: 150, display: "block" }}
      preserveAspectRatio="xMidYMax meet"
    >
      {/* dây treo cong */}
      <path
        d={`M 0 20 Q ${(count * 90) / 2} 70 ${count * 90} 20`}
        fill="none"
        stroke="#7A6A57"
        strokeWidth="2"
        opacity="0.5"
      />
      {lanterns.map((_, i) => {
        const x = 45 + i * 90;
        // độ võng của dây tại điểm treo (mô phỏng đường cong parabol phía trên)
        const t = i / (count - 1);
        const sway = 20 + Math.sin(t * Math.PI) * 50;
        const color = colors[i % colors.length];
        const delay = (i * 0.4).toFixed(1);
        return (
          <g
            key={i}
            style={{
              transformOrigin: `${x}px ${sway}px`,
              animation: `lantern-sway 3.5s ease-in-out ${delay}s infinite`,
            }}
          >
            <line x1={x} y1={sway} x2={x} y2={sway + 22} stroke="#7A6A57" strokeWidth="1.5" opacity="0.6" />
            <ellipse cx={x} cy={sway + 55} rx="20" ry="26" fill={color} opacity="0.95" />
            <rect x={x - 20} y={sway + 40} width="40" height="4" fill="#241A12" opacity="0.25" />
            <rect x={x - 20} y={sway + 65} width="40" height="4" fill="#241A12" opacity="0.25" />
            <circle cx={x} cy={sway + 84} r="3" fill="#241A12" opacity="0.35" />
          </g>
        );
      })}
      <style>{`
        @keyframes lantern-sway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
      `}</style>
    </svg>
  );
}
