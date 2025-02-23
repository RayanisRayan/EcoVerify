import { NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request, res: NextResponse) {
  try {
    const client = await clientPromise;
    const db = client.db('EcoVerify'); 
    const collection = db.collection('Recording'); 
    
    if (req.method === 'POST') {
      
      let { metadata, timestamp, sensor_data} = await req.json();
      if (!metadata || !timestamp || !sensor_data) {
        return NextResponse.json({ error: 'Missing metadata || !timestamp || sensor_data' });
      }
      timestamp = new Date(timestamp)
      const result = await collection.insertOne({ metadata,  timestamp, sensor_data });
      return NextResponse.json({ message: 'Recording added', data: result });
    }

    return NextResponse.json({ error: 'Method Not Allowed' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error });
  }
}
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('EcoVerify');
    const collection = db.collection('Recording');
    
    const latestRecording = await collection
      .find({ 'metadata.company': company })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    if (latestRecording.length === 0) {
      return NextResponse.json({ error: 'No recordings found for this company' });
    }

    return NextResponse.json({ message: 'Latest recording retrieved', data: latestRecording[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error });
  }
}
