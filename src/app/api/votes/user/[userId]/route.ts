import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    
    // Users can only fetch their own votes
    if (session.user.id !== resolvedParams.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const votes = await db.getUserVotes(resolvedParams.userId);
    
    return NextResponse.json(votes, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching user votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
