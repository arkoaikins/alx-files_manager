import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connect();
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(`mongodb://${host}:${port}/${database}`, {
        useUnifiedTopology: true,
      });
      this.connected = true;
    } catch (err) {
      console.error('Error connecting to MongoDB:', err);
    }
  }

  isAlive() {
    return this.connected && this.client.isConnected();
  }

  async getCollectionCount(collectionName) {
    if (!this.isAlive()) {
      throw new Error('Database connection is not alive');
    }

    const db = this.client.db();
    const count = await db.collection(collectionName).countDocuments();
    return count;
  }

  async nbUsers() {
    return this.getCollectionCount('users');
  }

  async nbFiles() {
    return this.getCollectionCount('files');
  }
}

const dbClient = new DBClient();

export default dbClient;
