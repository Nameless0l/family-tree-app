// app/api/trees/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { loadFamilyTree, saveFamilyTree, deleteFamilyTree } from '../../../../services/blobStorage';
import { FamilyTreeData } from '../../../../lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API] GET /api/trees/${id}`);
  
  try {
    const treeData = await loadFamilyTree(id);
    
    if (!treeData) {
      console.log(`[API] Arbre non trouvé: ${id}`);
      return NextResponse.json(
        { error: 'Arbre non trouvé' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Arbre trouvé: ${id}`);
    return NextResponse.json(treeData);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération de l\'arbre:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer l\'arbre', details: String(error) },
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
    
    const url = await saveFamilyTree(body);
    console.log(`[API] Arbre sauvegardé avec succès: ${id}`);
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
      return NextResponse.json(
        { error: 'Arbre non trouvé' },
        { status: 404 }
      );
    }
    
    const url = await saveFamilyTree(body);
    console.log(`[API] Arbre mis à jour avec succès: ${id}`);
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
        console.log(`[API] Arbre non trouvé pour suppression: ${id}`);
        return NextResponse.json(
          { error: 'Arbre non trouvé' },
          { status: 404 }
        );
      }
      
      console.log(`[API] Arbre trouvé, tentative de suppression: ${id}`);
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