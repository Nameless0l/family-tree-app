import { Person } from '../types';
import FamilyGraph from '../graph/FamilyGraph';

/**
 * Parcours en profondeur (Depth-First Search)
 * Explore aussi loin que possible le long de chaque branche avant de revenir en arrière
 */
export function depthFirstSearch(
  graph: FamilyGraph, 
  startPersonId: string, 
  maxDepth: number = Infinity
): Person[] {
  const visited = new Set<string>();
  const result: Person[] = [];
  
  function dfs(personId: string, depth: number) {
    if (visited.has(personId) || depth > maxDepth) return;
    visited.add(personId);
    
    const person = graph.getPerson(personId);
    if (person) {
      result.push(person);
      
      const children = graph.getChildren(personId);
      children.forEach(child => {
        dfs(child.id, depth + 1);
      });
    }
  }
  
  dfs(startPersonId, 0);
  return result;
}