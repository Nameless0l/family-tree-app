'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { TreeNodeData, Person } from '../../lib/types';

interface MermaidFamilyTreeProps {
  rootNode: TreeNodeData;
  onSelectPerson: (person: Person) => void;
}

const MermaidFamilyTree: React.FC<MermaidFamilyTreeProps> = ({ rootNode, onSelectPerson }) => {
  const [mermaidDefinition, setMermaidDefinition] = useState<string>('');
  const [people, setPeople] = useState<Person[]>([]);
  
  // Initialiser Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);
  
  // Générer la définition Mermaid à partir de l'arbre
  useEffect(() => {
    if (!rootNode) return;
    
    const allPeople: Person[] = [];
    let definition = 'graph TD;\n';
    
    // Fonction récursive pour construire le graphe
    const buildGraph = (node: TreeNodeData, parentId?: string) => {
      // Ajouter la personne à la liste
      allPeople.push(node);
      
      // Formater le label avec année de naissance et (éventuellement) de décès
      const years = node.deathYear 
        ? `(${node.birthYear} - ${node.deathYear})` 
        : `(${node.birthYear})`;
      
      // Créer le nœud
      definition += `  ${node.id}["${node.name}<br>${years}"];\n`;
      
      // Ajouter la relation parent-enfant si applicable
      if (parentId) {
        definition += `  ${parentId} --> ${node.id};\n`;
      }
      
      // Traiter récursivement les enfants
      node.children.forEach(child => {
        buildGraph(child, node.id);
      });
    };
    
    // Construire le graphe
    buildGraph(rootNode);
    
    // Style pour différencier les personnes décédées
    definition += '\n  classDef deceased fill:#E0E0E0;\n';
    
    // Appliquer le style aux personnes décédées
    allPeople.forEach(person => {
      if (person.deathYear) {
        definition += `  class ${person.id} deceased;\n`;
      }
    });
    
    setMermaidDefinition(definition);
    setPeople(allPeople);
    
  }, [rootNode]);
  
  // Rendu du graphe Mermaid
  useEffect(() => {
    if (mermaidDefinition) {
      try {
        mermaid.contentLoaded();
      } catch (error) {
        console.error('Erreur lors du rendu Mermaid:', error);
      }
    }
  }, [mermaidDefinition]);
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Diagramme Mermaid */}
      <div className="bg-white p-4 rounded-lg shadow-md flex-grow overflow-auto">
        <div className="mermaid">{mermaidDefinition}</div>
      </div>
      
      {/* Liste des personnes pour sélection */}
      <div className="w-full md:w-72 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-3">Personnes dans l'arbre</h3>
        <div className="max-h-[500px] overflow-y-auto">
          <ul className="space-y-2">
            {people.map(person => (
              <li 
                key={person.id}
                className={`p-2 rounded cursor-pointer ${
                  person.deathYear ? 'bg-gray-400 hover:bg-gray-300' : 'bg-green-500 hover:bg-green-400'
                }`}
                onClick={() => onSelectPerson(person)}
              >
                <div className="font-medium">{person.name}</div>
                <div className="text-sm text-gray-600">
                  {person.birthYear} {person.deathYear ? `- ${person.deathYear}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MermaidFamilyTree;