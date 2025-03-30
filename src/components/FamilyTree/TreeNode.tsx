import React, { useState } from 'react';
import { TreeNodeData } from '../../lib/types';
import NodeInfo from './NodeInfo';

interface TreeNodeProps {
  node: TreeNodeData;
  x: number;
  y: number;
  onNodeClick?: (node: TreeNodeData) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, x, y, onNodeClick }) => {
  const [showInfo, setShowInfo] = useState(false);
  
  const handleMouseEnter = () => {
    setShowInfo(true);
  };
  
  const handleMouseLeave = () => {
    setShowInfo(false);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Node clicked:', node.name);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };
  
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Cercle pour le nœud */}
      <circle
        r={30}
        fill={node.deathYear ? '#E0E0E0' : '#A0D9FF'}
        stroke="#333"
        strokeWidth={2}
      />
      
      {/* Nom de la personne */}
      <text
        textAnchor="middle"
        dy=".3em"
        style={{ 
          fontSize: '10px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}
      >
        {node.name}
      </text>
      
      {/* Afficher les informations au survol */}
      {showInfo && (
        <NodeInfo 
          node={node} 
          x={50} 
          y={0} 
        />
      )}
    </g>
  );
};

export default TreeNode;