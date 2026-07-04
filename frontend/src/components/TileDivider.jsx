// Đường diềm hình mái ngói âm dương — chi tiết kiến trúc đặc trưng phố cổ,
// dùng thay cho các đường phân cách chung chung (sóng, chéo...) giữa các section.
export default function TileDivider({ color = "#B94E2C", background = "#FBF1E1", flip = false }) {
  const scallops = 24;
  const width = scallops * 40;

  let d = `M0 0 `;
  for (let i = 0; i < scallops; i++) {
    const x = i * 40;
    d += `A 20 20 0 0 1 ${x + 40} 0 `;
  }
  d += `L ${width} 40 L 0 40 Z`;

  return (
    <div style={{ lineHeight: 0, background, transform: flip ? "scaleY(-1)" : "none" }}>
      <svg
        viewBox={`0 0 ${width} 40`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 32, display: "block" }}
      >
        <path d={d} fill={color} />
      </svg>
    </div>
  );
}
