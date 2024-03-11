import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import { dbClient } from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Basic ')) return res.status(401).json({ error: 'Unauthorized' });
    const [email, password] = Buffer.from(authorization.slice(6), 'base64').toString().split(':');
    const userCollection = dbClient.collection('users');
    const user = await userCollection.findOne({ email });
    if (!user || sha1(password) !== user.password) return res.status(401).json({ error: 'Unauthorized' });
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const userCollection = dbClient.collection('users');
    const user = await userCollection.findOne({ _id: userId });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
