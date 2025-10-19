import { NodeCircle } from "./NodeCircle";
import { TokenParticle } from "./TokenParticle";
import { nodes, tokenColors } from "../data/model";
import type { Link } from "../data/model";

interface NetworkGraphProps {
  links: Link[];
  hiddenNodes?: Set<string>;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ links, hiddenNodes }) => {
  const visibleNodes = nodes.filter(node => !hiddenNodes?.has(node.id));
  const nodeMap = Object.fromEntries(visibleNodes.map(n => [n.id, n]));
  const lineColor = "#4b5563";
  const defaultTokenColor = "#9ca3af";
  return (
    <svg width="900" height="600" style={{ background: "#0a0a0a" }}>
      {links.map((link, i) => {
        const src = nodeMap[link.source];
        const dst = nodeMap[link.target];
        if (!src || !dst) {
          return null;
        }
        const midY = (src.y + dst.y) / 2;
        const d = `M${src.x},${src.y} Q${(src.x + dst.x) / 2},${midY - 80} ${dst.x},${dst.y}`;
        const tokenEntries = link.tokens ?? [];
        const totalVolume = tokenEntries.reduce((sum, token) => sum + token.volumeUsd, 0);
        const strokeWidth = Math.min(6, 2 + totalVolume / 40000000);
        const tooltip = tokenEntries
          .map(token => {
            const volumeLabel = `$${(token.volumeUsd / 1_000_000).toFixed(1)}M`;
            const latencyLabel = `${(token.avgLatencyMs / 1000).toFixed(1)}s latency`;
            return `${token.symbol}: ${volumeLabel} • ${token.txPerMinute} tx/min • ${latencyLabel}`;
          })
          .join("\n");
        const transactions = link.transactions ?? [];
        return (
          <g key={link.id}>
            <path d={d} stroke={lineColor} strokeWidth={strokeWidth} fill="none" opacity={0.35} />
            <title>{`${link.source} → ${link.target}\n${tooltip}`}</title>
            {transactions.map((tx, txIndex) => {
              const color = tokenColors[tx.token] ?? defaultTokenColor;
              const delay = (txIndex % 10) * 0.2 + i * 0.1;
              const duration = 6;
              const size = Math.min(12, 4 + Math.log10(tx.amount + 1));
              return (
                <TokenParticle
                  key={`${link.id}-${tx.id}`}
                  path={d}
                  delay={delay}
                  color={color}
                  duration={duration}
                  size={size}
                />
              );
            })}
          </g>
        );
      })}
      {visibleNodes.map((n, i) => <NodeCircle key={n.id} {...n} label={n.id} type={n.type as any} />)}
    </svg>
  );
};
