interface NodeProps {
  x: number;
  y: number;
  label: string;
  type: "L1" | "Bridge" | "L2";
}

export const NodeCircle: React.FC<NodeProps> = ({ x, y, label, type }) => {
  const color = type === "L1" ? "#0077b6" : type === "Bridge" ? "#90e0ef" : "#00b4d8";
  return (
    <>
      <circle cx={x} cy={y} r={40} fill={color} opacity={0.9} />
      <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14">{label}</text>
    </>
  );
};
