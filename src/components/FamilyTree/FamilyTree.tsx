import React, { useEffect, useState } from 'react';
import { TreeNodeData } from '../../lib/types';
import TreeNode from './TreeNode';

interface FamilyTreeProps {
  rootNode: TreeNodeData;
  width: number;
  height: number;
  onNodeClick?: (node: TreeNodeData) => void;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ rootNode, width, height, onNodeClick }) => {
  const [nodes, setNodes] = useState<TreeNodeData[]>([]);
  const [links, setLinks] = useState<{ source: TreeNodeData; target: TreeNodeData }[]>([]);
  
  useEffect(() => {
    // Calculer les positions des nœuds (layout en arbre)
    const nodeList: TreeNodeData[] = [];
    const linkList: { source: TreeNodeData; target: TreeNodeData }[] = [];
    
    // Fonction pour calculer récursivement les positions
    const calculatePositions = (
      node: TreeNodeData,
      level: number,
      position: number,
      horizontalSpacing: number,
      verticalSpacing: number
    ) => {
      // Ajouter le nœud avec sa position calculée
      const positionedNode = {
        ...node,
        position: {
          x: position * horizontalSpacing,
          y: level * verticalSpacing,
          level
        }
      };
      
      nodeList.push(positionedNode);
      
      // Calculer les positions des enfants
      const childCount = node.children.length;
      if (childCount > 0) {
        const start = position - (childCount - 1) / 2;
        
        node.children.forEach((child, index) => {
          const childPos = start + index;
          
          // Créer un lien entre le parent et l'enfant
          linkList.push({
            source: positionedNode,
            target: child
          });
          
          // Calculer récursivement pour les enfants
          calculatePositions(
            child,
            level + 1,
            childPos,
            horizontalSpacing,
            verticalSpacing
          );
        });
      }
    };
    
    // Commencer le calcul à partir de la racine
    const horizontalSpacing = 120;
    const verticalSpacing = 100;
    calculatePositions(rootNode, 0, 0, horizontalSpacing, verticalSpacing);
    
    setNodes(nodeList);
    setLinks(linkList);
  }, [rootNode]);
  
  // Fonction pour centrer l'arbre dans le SVG
  const getTransform = () => {
    return `translate(${width / 2}, 50)`;
  };
  
  // Handler explicite pour les clics sur les nœuds
  const handleNodeClick = (node: TreeNodeData) => {
    console.log("FamilyTree: Node clicked:", node.name);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };
  
  return (
    <svg width={width} height={height} onClick={(e) => e.stopPropagation()}>
      <g transform={getTransform()}>
        {/* Dessiner les liens */}
        {links.map((link, index) => {
          if (!link.source.position || !link.target.position) return null;
          
          return (
            <line
              key={`link-${index}`}
              x1={link.source.position.x}
              y1={link.source.position.y}
              x2={link.target.position.x}
              y2={link.target.position.y}
              stroke="#999"
              strokeWidth={1.5}
            />
          );
        })}
        
        {/* Dessiner les nœuds */}
        {nodes.map((node) => {
          if (!node.position) return null;
          
          return (
            <TreeNode
              key={node.id}
              node={node}
              x={node.position.x}
              y={node.position.y}
              onNodeClick={handleNodeClick}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default FamilyTree;