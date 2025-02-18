import { NextResponse } from 'next/server';
import clientPromise from '../mongodb';

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
