import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db('mydatabase'); // Replace with your DB name
        const collection = db.collection('users'); // Replace with your collection

        if (req.method === 'POST') {
            const { name, email } = req.body;
            if (!name || !email) {
                return res.status(400).json({ error: 'Missing name or email' });
            }

            const result = await collection.insertOne({ name, email });
            return res.status(201).json({ message: 'User added', data: result });
        }

        if (req.method === 'GET') {
            const users = await collection.find({}).toArray();
            return res.status(200).json({ users });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', details: error });
    }
}
