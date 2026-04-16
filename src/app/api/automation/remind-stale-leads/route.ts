import { NextResponse } from 'next/server';

/** Ancienne relance automatique — désactivée côté produit. */
export async function POST() {
  return NextResponse.json(
    { error: 'Fonctionnalité désactivée' },
    { status: 410 },
  );
}
