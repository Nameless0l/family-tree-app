export interface Person {
    id: string;
    name: string;
    birthYear: number;
    deathYear?: number;
    parentId?: string; 
    spouseId?: string;
    imageUrl?: string;
    notes?: string;
  }
  
  export interface FamilyTreeData {
    id: string;
    name: string;
    description?: string;
    rootPersonId: string;
    people: Person[];
  }
  
  export type TreeNodePosition = {
    x: number;
    y: number;
    level: number;
  };
  
  export interface TreeNodeData extends Person {
    children: TreeNodeData[];
    position?: TreeNodePosition;
  }