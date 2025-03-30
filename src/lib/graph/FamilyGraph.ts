// lib/graph/FamilyGraph.ts

import { Person, TreeNodeData } from '../types';

export class FamilyGraph {
  private nodes: Map<string, Person>;
  private childrenMap: Map<string, string[]>;

  constructor(people: Person[]) {
    this.nodes = new Map();
    this.childrenMap = new Map();
    
    // Initialiser les nodes avec les personnes
    people.forEach(person => {
      this.nodes.set(person.id, person);
    });
    
    // Construire les relations parent-enfant
    people.forEach(person => {
      if (person.parentId) {
        const children = this.childrenMap.get(person.parentId) || [];
        children.push(person.id);
        this.childrenMap.set(person.parentId, children);
      }
    });
  }

  /**
   * Récupère une personne par son ID
   */
  getPerson(id: string): Person | undefined {
    return this.nodes.get(id);
  }

  /**
   * Récupère tous les enfants d'une personne
   */
  getChildren(personId: string): Person[] {
    const childrenIds = this.childrenMap.get(personId) || [];
    return childrenIds.map(id => this.nodes.get(id)).filter(Boolean) as Person[];
  }

  /**
   * Construit un arbre à partir d'une personne racine
   */
  buildTree(rootId: string): TreeNodeData | null {
    const person = this.getPerson(rootId);
    if (!person) return null;

    return this.buildTreeNode(person);
  }

  /**
   * Construit un nœud d'arbre récursivement
   */
  private buildTreeNode(person: Person): TreeNodeData {
    const children = this.getChildren(person.id);
    return {
      ...person,
      children: children.map(child => this.buildTreeNode(child))
    };
  }

  /**
   * Calcule l'âge d'une personne
   */
  calculateAge(personId: string): number | null {
    const person = this.getPerson(personId);
    if (!person) return null;

    const endYear = person.deathYear || new Date().getFullYear();
    return endYear - person.birthYear;
  }

  /**
   * Trouve tous les ancêtres d'une personne en utilisant un parcours en largeur
   */
  findAncestors(personId: string): Person[] {
    const ancestors: Person[] = [];
    let current = this.getPerson(personId);
    
    while (current && current.parentId) {
      const parent = this.getPerson(current.parentId);
      if (parent) {
        ancestors.push(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    return ancestors;
  }
}

export default FamilyGraph;