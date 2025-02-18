const uri = process.env.MONGODB_URI as string; // Load from .env file
const options = {};
import { MongoClient } from 'mongodb';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}


client = new MongoClient(uri, options);
clientPromise = client.connect();
export default clientPromise;