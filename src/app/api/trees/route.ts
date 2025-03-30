// app/api/trees/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Récupération de la liste des arbres");
    
    // Récupérer la liste de tous les arbres
    const { blobs } = await list({ prefix: 'trees/' });
    
    // Filtrer pour ne garder que les fichiers .json
    const jsonBlobs = blobs.filter(blob => 
      blob.pathname.endsWith('.json')
    );
    
    // Créer un Set pour éviter les doublons
    const uniqueTreeIds = new Set<string>();
    
    // Extraire les IDs des arbres à partir des noms de fichiers
    jsonBlobs.forEach(blob => {
      const filename = blob.pathname.split('/').pop() || '';
      const treeId = filename.replace('.json', '');
      uniqueTreeIds.add(treeId);
    });
    
    // Convertir le Set en tableau
    const treeIds = Array.from(uniqueTreeIds);
    
    console.log(`[API] ${treeIds.length} arbres trouvés`);
    
    return NextResponse.json({ trees: treeIds });
  } catch (error) {
    console.error('Erreur lors de la récupération des arbres:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les arbres', details: String(error) },
      { status: 500 }
    );
  }
}