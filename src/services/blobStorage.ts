// services/blobStorage.ts

import { put, list, del } from '@vercel/blob';
import { FamilyTreeData } from '../lib/types';

/**
 * Sauvegarde un arbre familial dans Vercel Blob
 * Cette fonction écrase le fichier existant portant le même ID
 */
export async function saveFamilyTree(treeData: FamilyTreeData): Promise<string> {
  try {
    console.log(`[Blob] Début de la sauvegarde de l'arbre: ${treeData.id}`);
    
    // Vérifier si un arbre avec cet ID existe déjà et le supprimer
    const { blobs } = await list({ prefix: `trees/${treeData.id}` });
    
    // Si un arbre existe déjà avec cet ID, le supprimer d'abord
    if (blobs.length > 0) {
      console.log(`[Blob] Un arbre existant avec l'ID ${treeData.id} a été trouvé. Suppression avant mise à jour.`);
      for (const blob of blobs) {
        try {
          await del(blob.url);
          console.log(`[Blob] Ancien fichier supprimé: ${blob.pathname}`);
        } catch (delError) {
          console.warn(`[Blob] Impossible de supprimer l'ancien fichier: ${blob.pathname}`, delError);
          // Continuer malgré l'erreur de suppression
        }
      }
    }
    
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
      
      // Vérifier que l'ID n'est pas vide
      if (!treeId || treeId.trim() === '') {
        console.error('[Blob] ID d\'arbre vide ou invalide');
        return null;
      }
      
      // Construire le préfixe pour la recherche
      // Utiliser un préfixe plus précis
      const blobPath = `trees/${treeId}.json`;
      console.log(`[Blob] Recherche précise du fichier: ${blobPath}`);
      
      try {
        // Récupérer la liste des blobs
        console.log(`[Blob] Listing des fichiers dans Vercel Blob...`);
        const { blobs } = await list({ prefix: blobPath });
        
        console.log(`[Blob] ${blobs.length} fichiers trouvés pour l'ID précis`);
        
        if (blobs.length === 0) {
          // Essayer avec un préfixe plus large
          const { blobs: looseBlobs } = await list({ prefix: `trees/${treeId}` });
          console.log(`[Blob] ${looseBlobs.length} fichiers trouvés avec préfixe large`);
          
          if (looseBlobs.length === 0) {
            // Lister tous les arbres disponibles pour le débogage
            const { blobs: allBlobs } = await list({ prefix: 'trees/' });
            console.log(`[Blob] Débogage - Tous les arbres disponibles:`, 
              allBlobs.map(b => ({ 
                path: b.pathname,
                url: b.url, 
                uploaded: b.uploadedAt,
                size: b.size
              })));
            
            return null;
          }
          
          // Utiliser le premier résultat du préfixe large
          const blob = looseBlobs[0];
          console.log(`[Blob] Utilisation du fichier trouvé avec préfixe large: ${blob.pathname}`);
          
          return await loadBlobData(blob);
        }
        
        // Récupérer le premier blob (ou le plus récent si tri)
        const blob = blobs[0];
        console.log(`[Blob] Récupération du fichier: ${blob.pathname}`);
        
        return await loadBlobData(blob);
      } catch (listError) {
        console.error('[Blob] Erreur lors du listing des fichiers:', listError);
        // Réessayer avec une méthode alternative si possible
        try {
          // Tentative directe avec un chemin fixe
          const directUrl = `https://public.blob.vercel-storage.com/trees/${treeId}.json`;
          console.log(`[Blob] Tentative directe de récupération depuis: ${directUrl}`);
          
          const response = await fetch(directUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          console.log(`[Blob] Parsing du JSON...`);
          const data = await response.json();
          return data;
        } catch (directError) {
          console.error('[Blob] Échec de la méthode alternative:', directError);
          throw listError; // Lancer l'erreur originale
        }
      }
    } catch (error) {
      console.error('[Blob] Erreur critique lors du chargement de l\'arbre familial:', error);
      // Ne pas masquer l'erreur - la renvoyer pour un meilleur débogage
      throw error;
    }
  }
  
  // Fonction interne pour charger les données d'un blob
  async function loadBlobData(blob: any): Promise<FamilyTreeData | null> {
    try {
      // Récupérer les données du blob
      console.log(`[Blob] Téléchargement du contenu depuis: ${blob.url}`);
      const response = await fetch(blob.url, {
        // Ajouter des paramètres pour éviter le cache
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error(`[Blob] Erreur HTTP lors de la récupération: ${response.status} ${response.statusText}`);
        throw new Error(`Impossible de récupérer les données: ${response.statusText}`);
      }
      
      console.log(`[Blob] Récupération réussie, content-type: ${response.headers.get('content-type')}`);
      
      // Récupérer le texte brut pour validation
      const rawText = await response.text();
      console.log(`[Blob] Texte brut récupéré, longueur: ${rawText.length} caractères`);
      
      if (!rawText || rawText.trim() === '') {
        console.error('[Blob] Fichier vide récupéré');
        return null;
      }
      
      // Tenter de parser le JSON
      try {
        const data = JSON.parse(rawText);
        console.log(`[Blob] Parsing JSON réussi, ID de l'arbre: ${data.id}`);
        return data;
      } catch (parseError) {
        console.error('[Blob] Erreur de parsing JSON:', parseError);
        console.error('[Blob] Extrait du texte récupéré:', rawText.substring(0, 200) + '...');
        throw new Error('Format JSON invalide');
      }
    } catch (error) {
      console.error('[Blob] Erreur lors du chargement des données du blob:', error);
      throw error;
    }
  }

/**
 * Supprime un arbre familial de Vercel Blob
 */
export async function deleteFamilyTree(treeId: string): Promise<boolean> {
  try {
    console.log(`[Blob] Tentative de suppression de l'arbre: ${treeId}`);
    
    // Rechercher tous les fichiers associés à cet ID
    const { blobs } = await list({ prefix: `trees/${treeId}` });
    
    if (blobs.length === 0) {
      console.log(`[Blob] Aucun arbre trouvé avec l'ID: ${treeId}`);
      return false;
    }
    
    // Supprimer tous les fichiers trouvés
    let success = true;
    for (const blob of blobs) {
      try {
        await del(blob.url);
        console.log(`[Blob] Fichier supprimé: ${blob.pathname}`);
      } catch (error) {
        console.error(`[Blob] Erreur lors de la suppression du fichier ${blob.pathname}:`, error);
        success = false;
      }
    }
    
    console.log(`[Blob] Suppression ${success ? 'réussie' : 'partiellement réussie'} de l'arbre: ${treeId}`);
    return success;
  } catch (error) {
    console.error('[Blob] Erreur lors de la suppression de l\'arbre familial:', error);
    return false;
  }
}