interface NodeProps {
  x: number;
  y: number;
  label: string;
  type: "L1" | "Bridge" | "L2";
  imageSrc?: string;
  imageRadius?: number;
}

export const NodeCircle: React.FC<NodeProps> = ({
  x,
  y,
  label,
  type,
  imageSrc,
  imageRadius,
}) => {
  const baseRadius = 40;
  const radius = imageSrc ? (imageRadius ?? 48) : baseRadius;

  if (imageSrc) {
    const size = radius * 2;
    return (
      <g>
        <image
          href={imageSrc}
          x={x - radius}
          y={y - radius}
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid slice"
          style={{ filter: "drop-shadow(0 8px 16px rgba(15, 23, 42, 0.45))" }}
        />
        <title>{label}</title>
      </g>
    );
  }

  const color =
    type === "L1" ? "#0077b6" : type === "Bridge" ? "#90e0ef" : "#00b4d8";
  return (
    <g>
      <circle cx={x} cy={y} r={baseRadius} fill={color} opacity={0.9} />
      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14">
        {label}
      </text>
      <title>{label}</title>
    </g>
  );
};
