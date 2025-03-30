// components/FamilyTree/MarkmapFamilyTree.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';
import { TreeNodeData, Person } from '../../lib/types';

interface MarkmapFamilyTreeProps {
  rootNode: TreeNodeData;
  onSelectPerson: (person: Person) => void;
}

const MarkmapFamilyTree: React.FC<MarkmapFamilyTreeProps> = ({ rootNode, onSelectPerson }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [peopleMap, setPeopleMap] = useState<Map<string, Person>>(new Map());
  
  // Fonction pour générer le markdown à partir de l'arbre
  const generateMarkdown = (node: TreeNodeData): string => {
    // Format: "# Person Name (birth - death)"
    const years = node.deathYear 
      ? `(${node.birthYear} - ${node.deathYear})` 
      : `(${node.birthYear})`;
    
    let md = `# ${node.name} ${years}\n`;
    
    if (node.children.length > 0) {
      node.children.forEach(child => {
        // Ajouter les enfants comme des sous-sections
        md += generateMarkdown(child).replace(/^# /, '## ');
      });
    }
    
    return md;
  };
  
  // Construire une map des personnes pour l'interaction
  useEffect(() => {
    if (!rootNode) return;
    
    const map = new Map<string, Person>();
    
    function addToMap(node: TreeNodeData) {
      map.set(node.name, node);
      node.children.forEach(addToMap);
    }
    
    addToMap(rootNode);
    setPeopleMap(map);
    
  }, [rootNode]);
  
  // Créer la mindmap
  useEffect(() => {
    if (!svgRef.current || !rootNode) return;
    
    // Nettoyer le SVG au cas où
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    
    // Générer le markdown
    const markdown = generateMarkdown(rootNode);
    
    // Transformer le markdown en données pour Markmap
    const transformer = new Transformer();
    const { root } = transformer.transform(markdown);
    
    // Créer la mindmap
    const markmap = Markmap.create(svgRef.current, {
      autoFit: true,
      zoom: true,
      pan: true,
      maxWidth: 500,
      style: (el: SVGElement) => {
        // Récupérer le texte du nœud (nom de la personne)
        const text = el.textContent || '';
        // Extraire juste le nom (sans les années)  
        const name = text.split('(')[0].trim();
        
        // Trouver la personne correspondante
        const person = peopleMap.get(name);
        
        if (person) {
          // Appliquer un style différent pour les personnes décédées
          if (person.deathYear) {
            el.setAttribute('fill', '#888');
          }
          
          // Ajouter un gestionnaire de clic
          el.style.cursor = 'pointer';
          el.onclick = (e) => {
            e.stopPropagation();
            onSelectPerson(person);
          };
        }
      }
    }, root);
    
    // Ajouter un gestionnaire pour les clics sur les cercles (markers)
    const markers = svgRef.current.querySelectorAll('circle.markmap-node');
    markers.forEach(marker => {
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        // Trouver le texte associé (frère suivant dans le DOM)
        const text = marker.nextElementSibling;
        if (text) {
          // Récupérer le nom
          const textContent = text.textContent || '';
          const name = textContent.split('(')[0].trim();
          // Trouver la personne et notifier
          const person = peopleMap.get(name);
          if (person) {
            onSelectPerson(person);
          }
        }
      });
    });
  }, [rootNode, peopleMap, onSelectPerson]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full overflow-auto">
      <div className="flex flex-col">
        <div className="text-sm text-gray-500 mb-2">
          Cliquez sur un nom ou un nœud pour sélectionner une personne
        </div>
        <svg 
          ref={svgRef} 
          width="100%" 
          height="600" 
          style={{ display: 'block', margin: '0 auto' }} 
        />
      </div>
    </div>
  );
};

export default MarkmapFamilyTree;