import { put, list, del } from '@vercel/blob';
import { FamilyTreeData } from '../lib/types';

/**
 * Sauvegarde un arbre familial dans Vercel Blob
 */
export async function saveFamilyTree(treeData: FamilyTreeData): Promise<string> {
  try {
    console.log(`[Blob] Début de la sauvegarde de l'arbre: ${treeData.id}`);
    
    // Convertir les données de l'arbre en JSON
    const jsonData = JSON.stringify(treeData);
    console.log(`[Blob] Données JSON préparées, taille: ${jsonData.length} caractères`);
    
    // Créer un Blob avec les données JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Construire le chemin du fichier
    const filePath = `trees/${treeData.id}.json`;
    console.log(`[Blob] Chemin du fichier: ${filePath}`);
    
    // Sauvegarder le Blob dans Vercel Blob storage
    console.log(`[Blob] Tentative de sauvegarde dans Vercel Blob...`);
    const { url } = await put(filePath, blob, { access: 'public' });
    
    console.log(`[Blob] Sauvegarde réussie à l'URL: ${url}`);
    return url;
  } catch (error) {
    console.error('[Blob] Erreur lors de la sauvegarde de l\'arbre familial:', error);
    throw error;
  }
}

/**
 * Charge un arbre familial depuis Vercel Blob
 */
export async function loadFamilyTree(treeId: string): Promise<FamilyTreeData | null> {
  try {
    console.log(`[Blob] Tentative de chargement de l'arbre: ${treeId}`);
    
    // Construire le préfixe pour la recherche
    const blobPrefix = `trees/${treeId}`;
    console.log(`[Blob] Recherche avec le préfixe: ${blobPrefix}`);
    
    // Récupérer la liste des blobs
    console.log(`[Blob] Listing des fichiers dans Vercel Blob...`);
    const { blobs } = await list({ prefix: blobPrefix });
    
    console.log(`[Blob] ${blobs.length} fichiers trouvés`);
    
    if (blobs.length === 0) {
      console.log(`[Blob] Aucun arbre trouvé avec l'ID: ${treeId}`);
      
      // Essayons de lister tous les arbres pour voir ce qui est disponible
      const { blobs: allBlobs } = await list({ prefix: 'trees/' });
      console.log(`[Blob] Tous les arbres disponibles:`, 
        allBlobs.map(b => ({ path: b.pathname, uploaded: b.uploadedAt })));
      
      return null;
    }
    
    // Récupérer le premier blob (ou le plus récent si tri)
    const blob = blobs[0];
    console.log(`[Blob] Récupération du fichier: ${blob.pathname}`);
    
    // Récupérer les données du blob
    console.log(`[Blob] Téléchargement du contenu depuis: ${blob.url}`);
    const response = await fetch(blob.url);
    
    if (!response.ok) {
      console.error(`[Blob] Erreur HTTP lors de la récupération: ${response.status} ${response.statusText}`);
      throw new Error(`Impossible de récupérer les données: ${response.statusText}`);
    }
    
    console.log(`[Blob] Parsing du JSON...`);
    const data: FamilyTreeData = await response.json();
    console.log(`[Blob] Données récupérées avec succès pour l'arbre: ${data.id}`);
    
    return data;
  } catch (error) {
    console.error('[Blob] Erreur lors du chargement de l\'arbre familial:', error);
    return null;
  }
}

/**
 * Supprime un arbre familial de Vercel Blob
 */
export async function deleteFamilyTree(treeId: string): Promise<boolean> {
  try {
    console.log(`[Blob] Tentative de suppression de l'arbre: ${treeId}`);
    
    // Récupérer tous les blobs correspondant à cet ID
    const { blobs } = await list({ prefix: `trees/${treeId}` });
    
    if (blobs.length === 0) {
      console.log(`[Blob] Aucun arbre trouvé avec l'ID: ${treeId}`);
      return false;
    }
    
    console.log(`[Blob] ${blobs.length} fichiers à supprimer pour l'arbre: ${treeId}`);
    
    // Supprimer chaque blob trouvé
    for (const blob of blobs) {
      console.log(`[Blob] Suppression du fichier: ${blob.pathname}`);
      try {
        // Essayer par URL
        await del(blob.url);
        console.log(`[Blob] Fichier supprimé par URL: ${blob.url}`);
      } catch (error) {
        console.error(`[Blob] Erreur lors de la suppression par URL, tentative par pathname: ${error}`);
        
        try {
          // Si l'URL échoue, essayer par pathname
          await del(blob.pathname);
          console.log(`[Blob] Fichier supprimé par pathname: ${blob.pathname}`);
        } catch (pathError) {
          console.error(`[Blob] Erreur lors de la suppression par pathname: ${pathError}`);
          throw pathError;
        }
      }
    }
    
    console.log(`[Blob] Suppression réussie de l'arbre: ${treeId}`);
    return true;
  } catch (error) {
    console.error('[Blob] Erreur lors de la suppression de l\'arbre familial:', error);
    return false;
  }
}