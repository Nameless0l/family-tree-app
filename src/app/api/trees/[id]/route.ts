// app/api/trees/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { loadFamilyTree, saveFamilyTree, deleteFamilyTree } from '../../../../services/blobStorage';
import { FamilyTreeData } from '../../../../lib/types';

// app/api/trees/[id]/route.ts - Méthode GET améliorée

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const id = params.id;
    console.log(`[API] GET /api/trees/${id}`);
    
    try {
      if (!id || id.trim() === '') {
        console.error('[API] ID vide ou invalide');
        return NextResponse.json(
          { error: 'ID invalide' },
          { status: 400 }
        );
      }
      
      console.log(`[API] Tentative de chargement de l'arbre avec ID: ${id}`);
      let treeData;
      
      try {
        treeData = await loadFamilyTree(id);
      } catch (loadError) {
        console.error(`[API] Erreur du service de chargement:`, loadError);
        return NextResponse.json(
          { error: `Erreur lors du chargement: ${loadError instanceof Error ? loadError.message : String(loadError)}` },
          { status: 500 }
        );
      }
      
      if (!treeData) {
        console.log(`[API] Arbre non trouvé: ${id}`);
        
        // Lister tous les arbres pour faciliter le débogage
        try {
          const { blobs } = await list({ prefix: 'trees/' });
          console.log(`[API] Tous les arbres disponibles:`, 
            blobs.map(b => ({ path: b.pathname })));
        } catch (listError) {
          console.error('[API] Impossible de lister les arbres:', listError);
        }
        
        return NextResponse.json(
          { error: 'Arbre non trouvé' },
          { status: 404 }
        );
      }
      
      // Vérification supplémentaire de l'intégrité des données
      if (!treeData.id || !treeData.people || !Array.isArray(treeData.people)) {
        console.error(`[API] Données d'arbre corrompues:`, treeData);
        return NextResponse.json(
          { error: 'Données d\'arbre corrompues ou incomplètes' },
          { status: 500 }
        );
      }
      
      console.log(`[API] Arbre chargé avec succès: ${id}, ${treeData.people.length} personnes`);
      
      // Ajouter des en-têtes pour éviter les problèmes de cache
      const headers = new Headers();
      headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      headers.append('Pragma', 'no-cache');
      headers.append('Expires', '0');
      
      return NextResponse.json(treeData, {
        headers,
        status: 200
      });
    } catch (error) {
      console.error('[API] Erreur inattendue lors de la récupération de l\'arbre:', error);
      
      // Renvoyer des détails d'erreur pour le débogage
      return NextResponse.json(
        { 
          error: 'Erreur serveur inattendue', 
          details: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  }
  
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API] POST /api/trees/${id}`);
  
  try {
    const body = await request.json();
    
    if (!body || !body.id || body.id !== id) {
      console.log(`[API] Données invalides pour l'arbre: ${id}`, body);
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }
    
    // Vérifier si cet arbre existe déjà
    const existingTree = await loadFamilyTree(id);
    
    if (existingTree) {
      console.log(`[API] Attention: Un arbre avec l'ID ${id} existe déjà. Utiliser PUT pour le mettre à jour.`);
    }
    
    const url = await saveFamilyTree(body);
    console.log(`[API] Arbre sauvegardé avec succès: ${id} à ${url}`);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('[API] Erreur lors de la sauvegarde de l\'arbre:', error);
    return NextResponse.json(
      { error: 'Impossible de sauvegarder l\'arbre', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API] PUT /api/trees/${id} (mise à jour)`);
  
  try {
    const body = await request.json();
    
    if (!body || !body.id || body.id !== id) {
      console.log(`[API] Données invalides pour l'arbre: ${id}`, body);
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'arbre existe avant de le mettre à jour
    const existingTree = await loadFamilyTree(id);
    
    if (!existingTree) {
      console.log(`[API] Tentative de mise à jour d'un arbre qui n'existe pas: ${id}`);
      return NextResponse.json(
        { error: 'Arbre non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Mise à jour de l'arbre existant: ${id}`);
    const url = await saveFamilyTree(body);
    console.log(`[API] Arbre mis à jour avec succès: ${id} à ${url}`);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('[API] Erreur lors de la mise à jour de l\'arbre:', error);
    return NextResponse.json(
      { error: 'Impossible de mettre à jour l\'arbre', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API] DELETE /api/trees/${id}`);
  
  try {
    // Vérifier que l'arbre existe avant de le supprimer
    const existingTree = await loadFamilyTree(id);
    
    if (!existingTree) {
      console.log(`[API] Tentative de suppression d'un arbre qui n'existe pas: ${id}`);
      return NextResponse.json(
        { error: 'Arbre non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Suppression de l'arbre: ${id}`);
    const success = await deleteFamilyTree(id);
    
    if (!success) {
      console.log(`[API] Échec de la suppression de l'arbre: ${id}`);
      return NextResponse.json(
        { error: 'Échec de la suppression' },
        { status: 500 }
      );
    }
    
    console.log(`[API] Arbre supprimé avec succès: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Erreur lors de la suppression de l\'arbre:', error);
    return NextResponse.json(
      { error: 'Impossible de supprimer l\'arbre', details: String(error) },
      { status: 500 }
    );
  }
}