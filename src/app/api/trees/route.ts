import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    // Récupérer la liste de tous les arbres
    const { blobs } = await list({ prefix: 'trees/' });
    
    // Extraire les IDs des arbres à partir des noms de fichiers
    const treeIds = blobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || '';
      return filename.replace('.json', '');
    });
    
    return NextResponse.json({ trees: treeIds });
  } catch (error) {
    console.error('Erreur lors de la récupération des arbres:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les arbres' },
      { status: 500 }
    );
  }
}