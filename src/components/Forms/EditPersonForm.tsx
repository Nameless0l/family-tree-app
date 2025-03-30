'use client';

import React, { useState, useEffect } from 'react';
import { Person } from '../../lib/types';

interface EditPersonFormProps {
  treeId: string;
  person: Person;
  people: Person[];
  onPersonEdited: (updatedPerson: Person) => void;
  onCancel: () => void;
}

const EditPersonForm: React.FC<EditPersonFormProps> = ({
  treeId,
  person,
  people,
  onPersonEdited,
  onCancel,
}) => {
  const [name, setName] = useState(person.name);
  const [birthYear, setBirthYear] = useState<string>(person.birthYear.toString());
  const [deathYear, setDeathYear] = useState<string>(person.deathYear?.toString() || '');
  const [parentId, setParentId] = useState<string>(person.parentId || '');
  const [notes, setNotes] = useState(person.notes || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pour éviter les cycles dans l'arbre, on filtre les personnes qui ne peuvent pas être parentes
  const eligibleParents = people.filter(p => p.id !== person.id && !isDescendantOf(p.id, person.id, people));

  // Vérifie si une personne est descendante d'une autre
  function isDescendantOf(possibleDescendantId: string, ancestorId: string, peopleList: Person[]): boolean {
    const possibleDescendant = peopleList.find(p => p.id === possibleDescendantId);
    
    if (!possibleDescendant || !possibleDescendant.parentId) {
      return false;
    }
    
    if (possibleDescendant.parentId === ancestorId) {
      return true;
    }
    
    return isDescendantOf(possibleDescendant.parentId, ancestorId, peopleList);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!birthYear || isNaN(Number(birthYear))) {
      setError('L\'année de naissance doit être un nombre valide');
      return;
    }

    if (deathYear && isNaN(Number(deathYear))) {
      setError('L\'année de décès doit être un nombre valide');
      return;
    }

    if (deathYear && Number(deathYear) < Number(birthYear)) {
      setError('L\'année de décès doit être postérieure à l\'année de naissance');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Créer la personne mise à jour
      const updatedPerson: Person = {
        ...person,
        name: name.trim(),
        birthYear: Number(birthYear),
        deathYear: deathYear ? Number(deathYear) : undefined,
        parentId: parentId || undefined,
        notes: notes || undefined,
      };

      // Récupérer l'arbre actuel
      const response = await fetch(`/api/trees/${treeId}`);
      if (!response.ok) {
        throw new Error('Impossible de récupérer l\'arbre');
      }

      const treeData = await response.json();

      // Mettre à jour la personne dans l'arbre
      const personIndex = treeData.people.findIndex((p: Person) => p.id === person.id);
      if (personIndex !== -1) {
        treeData.people[personIndex] = updatedPerson;
      } else {
        throw new Error('Personne non trouvée dans l\'arbre');
      }

      // Sauvegarder l'arbre mis à jour
      const updateResponse = await fetch(`/api/trees/${treeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(treeData),
      });

      if (!updateResponse.ok) {
        throw new Error('Impossible de mettre à jour l\'arbre');
      }

      // Notifier le parent que la personne a été mise à jour
      onPersonEdited(updatedPerson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Modifier une personne</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="birthYear">
              Année de naissance
            </label>
            <input
              id="birthYear"
              type="number"
              className="w-full p-2 text-gray-700 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="deathYear">
              Année de décès (optionnel)
            </label>
            <input
              id="deathYear"
              type="number"
              className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={deathYear}
              onChange={(e) => setDeathYear(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="parentId">
            Parent
          </label>
          <select
            id="parentId"
            className="w-full p-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            disabled={loading}
          >
            <option value="">Aucun (personne racine)</option>
            {eligibleParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.birthYear}{p.deathYear ? ` - ${p.deathYear}` : ''})
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            className="w-full p-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPersonForm;