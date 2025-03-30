'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [trees, setTrees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const response = await fetch('/api/trees');
        if (!response.ok) {
          throw new Error('Impossible de récupérer la liste des arbres');
        }
        
        const data = await response.json();
        setTrees(data.trees || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrees();
  }, []);
  
  const handleCreateNewTree = async () => {
    // Dans une application complète, cela ouvrirait un formulaire de création
    // Pour simplifier, nous créons juste un arbre avec des données de test
    const newTreeId = `tree-${Date.now()}`;
    const demoData = {
      id: newTreeId,
      name: 'Nouvel Arbre Familial',
      description: 'Un nouvel arbre créé le ' + new Date().toLocaleDateString(),
      rootPersonId: 'person-1',
      people: [
        {
          id: 'person-1',
          name: 'Ancêtre',
          birthYear: 1900,
          deathYear: 1980
        },
        {
          id: 'person-2',
          name: 'Enfant 1',
          birthYear: 1930,
          parentId: 'person-1'
        },
        {
          id: 'person-3',
          name: 'Enfant 2',
          birthYear: 1935,
          parentId: 'person-1'
        },
        {
          id: 'person-4',
          name: 'Petit-enfant 1',
          birthYear: 1960,
          parentId: 'person-2'
        },
        {
          id: 'person-5',
          name: 'Petit-enfant 2',
          birthYear: 1965,
          parentId: 'person-3'
        }
      ]
    };
    
    try {
      // Sauvegarder l'arbre dans Blob
      const response = await fetch(`/api/trees/${newTreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(demoData)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'arbre');
      }
      
      await response.json();
      
      // Rediriger vers la page de l'arbre
      router.push(`/tree/${newTreeId}`);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Impossible de créer l\'arbre');
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Arbres Généalogiques</h1>
      
      <button
        className="mb-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        onClick={handleCreateNewTree}
      >
        Créer un nouvel arbre
      </button>
      
      {loading ? (
        <p>Chargement...</p>
      ) : trees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map(treeId => (
            <div 
              key={treeId}
              className="bg-gray-400 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/tree/${treeId}`)}
            >
              <h2 className="text-xl font-semibold mb-2">Arbre: {treeId}</h2>
              <p className="text-gray-600">Cliquez pour voir cet arbre généalogique</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucun arbre généalogique trouvé. Créez-en un nouveau pour commencer!</p>
      )}
    </div>
  );
}