import { NextResponse } from 'next/server';
import clientPromise from '../mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request, res: NextResponse) {

  try {
    const client = await clientPromise;
    const db = client.db('EcoVerify');
    const Recordingcollection = db.collection('Recording');
    const Usercollection = db.collection('Users');
    if (req.method === 'POST') {
      let data = await req.json();
      const userData = await Usercollection.findOne({ "devices.deviceID": data['uuid'] })
      let location = ""
      if (userData)
      for (var item of userData['devices']) {
        if (item['deviceID'] === data['uuid']) {
          location = item['location'];
          break;
        }
      }

      for (var item of data['data']) {

        item['timestamp'] = new Date(item['timestamp']);


      }
      let docsToInsert = []
      
      if (userData)
      for (var item of data['data']) {
        docsToInsert.push({
          'metadata': {
            'company': userData['companyName'],
            'location': location,
            'uuid':data['uuid']
          },
          'sensor_data' :{
            "temperature":item['temperature'],
            "humidity":item['humidity']/100
          },
          'timestamp':item['timestamp']
        })
        
      }
      // console.log(docsToInsert)
      
      const result = await Recordingcollection.insertMany(docsToInsert);
      return NextResponse.json({ message: 'Recording added', timestamp: new Date().toLocaleString(undefined, { timeZoneName: 'short' }) });
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
    const uuid = searchParams.get('device');
    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('EcoVerify');
    const collection = db.collection('Recording');
    
    const latestRecording = await collection
      .find({ 'metadata.company': company,'metadata.uuid':uuid })
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
