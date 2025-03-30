import { Person } from '../types';
import FamilyGraph from '../graph/FamilyGraph';

/**
 * Trouve tous les descendants d'une personne
 */
export function findDescendants(graph: FamilyGraph, personId: string): Person[] {
  const visited = new Set<string>();
  const descendants: Person[] = [];
  
  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    const children = graph.getChildren(id);
    children.forEach(child => {
      descendants.push(child);
      traverse(child.id);
    });
  }
  
  traverse(personId);
  return descendants;
}

/**
 * Trouve la relation entre deux personnes (simplifiée)
 */
export function findRelationship(graph: FamilyGraph, person1Id: string, person2Id: string): string {
  // Cette fonction est simplifiée et pourrait être beaucoup plus complexe
  // pour déterminer des relations comme "cousin au second degré", etc.
  
  // Vérifier si person1 est un ancêtre de person2
  const ancestors = graph.findAncestors(person2Id);
  if (ancestors.some(ancestor => ancestor.id === person1Id)) {
    return "Ancêtre";
  }
  
  // Vérifier si person2 est un descendant de person1
  const descendants = findDescendants(graph, person1Id);
  if (descendants.some(descendant => descendant.id === person2Id)) {
    return "Descendant";
  }
  
  return "Relation indéterminée";
}