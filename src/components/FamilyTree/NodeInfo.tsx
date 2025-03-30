import React from 'react';
import { TreeNodeData } from '../../lib/types';

interface NodeInfoProps {
  node: TreeNodeData;
  x: number;
  y: number;
}

const NodeInfo: React.FC<NodeInfoProps> = ({ node, x, y }) => {
  const currentYear = new Date().getFullYear();
  const age = node.deathYear 
    ? node.deathYear - node.birthYear
    : currentYear - node.birthYear;
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-10}
        y={-40}
        width={160}
        height={80}
        rx={5}
        ry={5}
        fill="white"
        stroke="#333"
        strokeWidth={1}
      />
      
      <text x={0} y={-20} style={{ fontSize: '12px' }}>
        Naissance: {node.birthYear}
      </text>
      
      <text x={0} y={0} style={{ fontSize: '12px' }}>
        Âge: {age} ans
      </text>
      
      {node.deathYear && (
        <text x={0} y={20} style={{ fontSize: '12px' }}>
          Décès: {node.deathYear}
        </text>
      )}
    </g>
  );
};

export default NodeInfo;