'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MermaidFamilyTree from '../../../components/FamilyTree/MermaidFamilyTree';
import AddPersonForm from '../../../components/Forms/AddPersonForm';
import EditPersonForm from '../../../components/Forms/EditPersonForm';
import FamilyGraph from '../../../lib/graph/FamilyGraph';
import { FamilyTreeData, Person, TreeNodeData } from '../../../lib/types';
import { breadthFirstSearch } from '../../../lib/algorithms/bfs';
import { findDescendants } from '../../../lib/algorithms/findRelatives';

enum FormMode {
  NONE,
  ADD,
  EDIT
}

export default function TreePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<FamilyTreeData | null>(null);
  const [rootNode, setRootNode] = useState<TreeNodeData | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [graph, setGraph] = useState<FamilyGraph | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(FormMode.NONE);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePersonConfirm, setShowDeletePersonConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

// Extrait pour app/tree/[id]/page.tsx - fetchTreeData amélioré

// Extrait pour app/tree/[id]/page.tsx - fetchTreeData amélioré

const fetchTreeData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Tentative de chargement de l'arbre: ${id}`);
      
      // Ajouter un timestamp pour éviter le cache
      const response = await fetch(`/api/trees/${id}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur HTTP: ${response.status}`, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      // Récupérer d'abord en tant que texte pour débogage
      const rawText = await response.text();
      console.log(`Données brutes reçues, longueur: ${rawText.length} caractères`);
      
      // Vérifier que le texte est un JSON valide
      if (!rawText || rawText.trim() === '') {
        throw new Error('Données vides reçues du serveur');
      }
      
      try {
        const data = JSON.parse(rawText);
        console.log(`Données JSON parsées avec succès, ID: ${data.id}`);
        setTreeData(data);
        
        // Vérifier que nous avons les données essentielles
        if (!data.people || !Array.isArray(data.people) || data.people.length === 0) {
          throw new Error('Arbre sans personnes');
        }
        
        if (!data.rootPersonId) {
          throw new Error('ID de personne racine manquant');
        }
        
        // Créer le graphe
        const familyGraph = new FamilyGraph(data.people);
        setGraph(familyGraph);
        
        // Construire l'arbre à partir de la racine
        const rootNodeData = familyGraph.buildTree(data.rootPersonId);
        if (rootNodeData) {
          setRootNode(rootNodeData);
        } else {
          throw new Error(`Impossible de construire l'arbre à partir de la racine (ID: ${data.rootPersonId})`);
        }
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        console.error('Extrait des données:', rawText.substring(0, 200) + '...');
        throw new Error(`Erreur de parsing: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError(`Une erreur est survenue lors du chargement de l'arbre: ${error instanceof Error ? error.message : String(error)}`);
      setTreeData(null);
      setRootNode(null);
      setGraph(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreeData();
  }, [id]);
  
  const handleFindDescendants = (personId: string) => {
    if (!graph) return;
    
    const descendants = findDescendants(graph, personId);
    alert(`${descendants.length} descendants trouvés pour cette personne.`);
  };
  
  const handleFindRelatives = (personId: string, depth: number = 2) => {
    if (!graph) return;
    
    const relatives = breadthFirstSearch(graph, personId, depth);
    alert(`${relatives.length} proches (jusqu'à ${depth} générations) trouvés pour cette personne.`);
  };
  
  const handleSelectPerson = (person: Person) => {
    console.log("Personne sélectionnée:", person.name);
    setSelectedPerson(person);
    setFormMode(FormMode.NONE);
  };
  
  const handleAddPerson = () => {
    setSelectedPerson(null);
    setFormMode(FormMode.ADD);
  };
  const handleViewMairmaid = () => {
    setSelectedPerson(null);
    setFormMode(FormMode.ADD);
  };
  
  const handleEditPerson = () => {
    if (selectedPerson) {
      setFormMode(FormMode.EDIT);
    }
  };
  
  const handleDeletePerson = async () => {
    if (!treeData || !selectedPerson) return;
    
    try {
      setIsDeleting(true);
      
      // Vérifier si la personne est la racine
      if (selectedPerson.id === treeData.rootPersonId) {
        alert("Impossible de supprimer la personne racine de l'arbre.");
        setShowDeletePersonConfirm(false);
        setIsDeleting(false);
        return;
      }
      
      // Vérifier si la personne a des enfants
      const children = treeData.people.filter(p => p.parentId === selectedPerson.id);
      if (children.length > 0) {
        alert("Cette personne a des enfants. Veuillez d'abord supprimer ou réassigner ses enfants.");
        setShowDeletePersonConfirm(false);
        setIsDeleting(false);
        return;
      }
      
      // Supprimer la personne
      const updatedPeople = treeData.people.filter(p => p.id !== selectedPerson.id);
      const updatedTree = {
        ...treeData,
        people: updatedPeople
      };
      
      // Sauvegarder l'arbre mis à jour
      const response = await fetch(`/api/trees/${treeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTree)
      });
      
      if (!response.ok) {
        throw new Error('Impossible de mettre à jour l\'arbre');
      }
      
      // Rafraîchir les données
      setSelectedPerson(null);
      fetchTreeData();
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Impossible de supprimer la personne');
    } finally {
      setShowDeletePersonConfirm(false);
      setIsDeleting(false);
    }
  };
  
  const handlePersonAdded = async (newPerson: Person) => {
    if (!treeData) return;
    
    try {
      setIsDeleting(true); // Réutiliser cet état pour indiquer le chargement
      
      // Ajouter la nouvelle personne à l'arbre existant
      const updatedTree = {
        ...treeData,
        people: [...treeData.people, newPerson]
      };
      
      console.log(`Mise à jour de l'arbre ${updatedTree.id} avec nouvelle personne:`, newPerson);
      
      // Sauvegarder l'arbre mis à jour avec le même ID
      const response = await fetch(`/api/trees/${treeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTree)
      });
      
      if (!response.ok) {
        throw new Error('Impossible de mettre à jour l\'arbre');
      }
      
      // Mettre à jour l'interface immédiatement
      setTreeData(updatedTree);
      
      // Reconstruire le graphe
      const familyGraph = new FamilyGraph(updatedTree.people);
      setGraph(familyGraph);
      
      // Construire le nouvel arbre avec la personne ajoutée
      const rootNodeData = familyGraph.buildTree(updatedTree.rootPersonId);
      if (rootNodeData) {
        setRootNode(rootNodeData);
      }
      
      // Passer en mode normal
      setFormMode(FormMode.NONE);
      
      // Forcer le rendu de l'arbre
      setRenderKey(prev => prev + 1);
      
      // Message de succès
      alert(`Personne "${newPerson.name}" ajoutée avec succès!`);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handlePersonEdited = async (updatedPerson: Person) => {
    if (!treeData) return;
    
    try {
      setIsDeleting(true); // Réutiliser cet état pour indiquer le chargement
      
      // S'assurer que l'ID de l'arbre reste le même
      const updatedTree = {
        ...treeData,
        people: treeData.people.map(person => 
          person.id === updatedPerson.id ? updatedPerson : person
        )
      };
      
      console.log(`Mise à jour de l'arbre ${updatedTree.id} avec personne modifiée:`, updatedPerson);
      
      // Sauvegarder l'arbre mis à jour avec le même ID
      const response = await fetch(`/api/trees/${treeData.id}`, {
        method: 'PUT', // Utiliser PUT pour une mise à jour
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTree)
      });
      
      if (!response.ok) {
        throw new Error('Impossible de mettre à jour l\'arbre');
      }
      
      // Mettre à jour l'interface immédiatement
      setTreeData(updatedTree);
      
      // Construire le nouvel arbre avec la personne mise à jour
      if (graph) {
        const rootNodeData = graph.buildTree(updatedTree.rootPersonId);
        if (rootNodeData) {
          setRootNode(rootNodeData);
        }
      }
      
      // Mettre à jour la personne sélectionnée
      setSelectedPerson(updatedPerson);
      
      // Passer en mode normal
      setFormMode(FormMode.NONE);
      
      // Forcer le rendu de l'arbre
      setRenderKey(prev => prev + 1);
      
      // Message de succès
      alert(`Personne "${updatedPerson.name}" mise à jour avec succès!`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteTree = async () => {
    if (!treeData) return;
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/trees/${treeData.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log(response)
        throw new Error('Impossible de supprimer l\'arbre');
      }
      
      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Impossible de supprimer l\'arbre');
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push('/')}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }
  
  if (!treeData || !rootNode) {
    return <div>Aucune donnée disponible</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{treeData.name}</h1>
        
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleAddPerson}
          >
            Ajouter une personne
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => router.push(`/markmap/${id}`)}
          >
            Visualiser en markmap
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Supprimer cet arbre
          </button>
        </div>
      </div>
      
      {treeData.description && (
        <p className="mb-6 text-gray-700">{treeData.description}</p>
      )}
      
      {formMode === FormMode.ADD ? (
        <AddPersonForm
          treeId={treeData.id}
          people={treeData.people}
          onPersonAdded={handlePersonAdded}
          onCancel={() => setFormMode(FormMode.NONE)}
        />
      ) : formMode === FormMode.EDIT && selectedPerson ? (
        <EditPersonForm
          treeId={treeData.id}
          person={selectedPerson}
          people={treeData.people}
          onPersonEdited={handlePersonEdited}
          onCancel={() => setFormMode(FormMode.NONE)}
        />
      ) : (
        <>
          {/* Arbre généalogique avec Mermaid */}
          <div className="mb-8">
            <MermaidFamilyTree 
              rootNode={rootNode}
              onSelectPerson={handleSelectPerson}
            />
          </div>
        </>
      )}
      
      {selectedPerson && formMode === FormMode.NONE && (
        <div className="mt-8 p-4 bg-gray-500 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold mb-2">{selectedPerson.name}</h2>
              <p>Naissance: {selectedPerson.birthYear}</p>
              {selectedPerson.deathYear && <p>Décès: {selectedPerson.deathYear}</p>}
              {selectedPerson.notes && (
                <p className="mt-2 italic text-gray-600">{selectedPerson.notes}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                onClick={handleEditPerson}
              >
                Modifier
              </button>
              
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => setShowDeletePersonConfirm(true)}
                disabled={selectedPerson.id === treeData.rootPersonId}
                title={selectedPerson.id === treeData.rootPersonId ? "Impossible de supprimer la personne racine" : ""}
              >
                Supprimer
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-4">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => handleFindDescendants(selectedPerson.id)}
            >
              Voir les descendants
            </button>
            <button
              className="px-3 py-1 bg-green-500 text-white rounded"
              onClick={() => handleFindRelatives(selectedPerson.id, 2)}
            >
              Voir les proches
            </button>
          </div>
        </div>
      )}
      
      {/* Confirmation de suppression d'arbre */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Supprimer l'arbre</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer cet arbre généalogique ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteTree}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation de suppression de personne */}
      {showDeletePersonConfirm && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Supprimer une personne</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{selectedPerson.name}</strong> de l'arbre ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setShowDeletePersonConfirm(false)}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeletePerson}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function setRenderKey(arg0: (prev: any) => any) {
    throw new Error('Function not implemented.');
}
