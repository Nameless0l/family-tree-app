import { Person } from '../types';
import FamilyGraph from '../graph/FamilyGraph';

/**
 * Parcours en largeur (Breadth-First Search)
 * Trouve toutes les personnes à une certaine distance de la personne de départ
 */
export function breadthFirstSearch(
  graph: FamilyGraph, 
  startPersonId: string, 
  maxDepth: number = Infinity
): Person[] {
  const visited = new Set<string>();
  const queue: { personId: string; depth: number }[] = [{ personId: startPersonId, depth: 0 }];
  const result: Person[] = [];

  while (queue.length > 0) {
    const { personId, depth } = queue.shift()!;
    
    if (visited.has(personId)) continue;
    visited.add(personId);
    
    const person = graph.getPerson(personId);
    if (person) {
      result.push(person);
      
      // Si on n'a pas atteint la profondeur maximale, on continue
      if (depth < maxDepth) {
        const children = graph.getChildren(personId);
        children.forEach(child => {
          if (!visited.has(child.id)) {
            queue.push({ personId: child.id, depth: depth + 1 });
          }
        });
      }
    }
  }
  
  return result;
}