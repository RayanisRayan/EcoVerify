import { NextResponse } from 'next/server';
import clientPromise from '../../mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const uuid = searchParams.get('device');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('EcoVerify');
    const collection = db.collection('Recording');

    const query: any = { 'metadata.company': company };
    if (uuid) query['metadata.uuid'] = uuid;

    const historicalRecordings = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    if (historicalRecordings.length === 0) {
      return NextResponse.json({ error: 'No recordings found for this company/device' });
    }

    return NextResponse.json({
      message: `Last ${limit} recordings retrieved`,
      data: historicalRecordings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error });
  }
}
