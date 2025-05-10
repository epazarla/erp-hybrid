import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';
import { User, Task, Client } from './models';

dotenv.config();

// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-hybrid';

// Singleton sınıfı
class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private users: Collection | null = null;
  private tasks: Collection | null = null;
  private clients: Collection | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  // Singleton instance
  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  // MongoDB'ye bağlan
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('MongoDB zaten bağlı');
      return;
    }

    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db();
      
      // Koleksiyonları oluştur
      this.users = this.db.collection('users');
      this.tasks = this.db.collection('tasks');
      this.clients = this.db.collection('clients');
      
      this.isConnected = true;
      console.log('MongoDB bağlantısı başarılı');
    } catch (error) {
      console.error('MongoDB bağlantı hatası:', error);
      throw error;
    }
  }

  // Bağlantıyı kapat
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB bağlantısı kapatıldı');
    }
  }

  // Kullanıcı işlemleri
  public async createUser(email: string, password_hash: string, name: string, role: string): Promise<User> {
    if (!this.users) throw new Error('MongoDB bağlantısı yok');
    
    // E-posta kontrolü
    const existingUser = await this.users.findOne({ email });
    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor.');
    }

    const now = new Date();
    const newUser: User = {
      id: Date.now(),
      email,
      password_hash,
      name,
      role,
      created_at: now
    };

    await this.users.insertOne(newUser);
    return newUser;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    if (!this.users) throw new Error('MongoDB bağlantısı yok');
    
    const user = await this.users.findOne({ email }) as unknown as User;
    return user;
  }

  public async listUsers(): Promise<User[]> {
    if (!this.users) throw new Error('MongoDB bağlantısı yok');
    
    const users = await this.users.find().toArray() as unknown as User[];
    return users;
  }

  // Görev işlemleri
  public async createTask(title: string, description: string, assigned_to: number, due_date: string): Promise<Task> {
    if (!this.tasks) throw new Error('MongoDB bağlantısı yok');
    
    const now = new Date();
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      assigned_to,
      status: 'yeni',
      due_date: new Date(due_date),
      created_at: now
    };

    await this.tasks.insertOne(newTask);
    return newTask;
  }

  public async listTasks(): Promise<Task[]> {
    if (!this.tasks) throw new Error('MongoDB bağlantısı yok');
    
    const tasks = await this.tasks.find().toArray() as unknown as Task[];
    return tasks;
  }

  public async getTasksByUser(userId: number): Promise<Task[]> {
    if (!this.tasks) throw new Error('MongoDB bağlantısı yok');
    
    const tasks = await this.tasks.find({ assigned_to: userId }).toArray() as unknown as Task[];
    return tasks;
  }

  // Müşteri işlemleri
  public async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    if (!this.clients) throw new Error('MongoDB bağlantısı yok');
    
    const now = new Date();
    const newClient: any = {
      id: Date.now(),
      ...clientData,
      createdAt: now,
      updatedAt: now
    };

    await this.clients.insertOne(newClient);
    return newClient as Client;
  }

  public async listClients(): Promise<Client[]> {
    if (!this.clients) throw new Error('MongoDB bağlantısı yok');
    
    const clients = await this.clients.find().toArray() as unknown as Client[];
    return clients;
  }

  public async getClientById(id: number): Promise<Client | null> {
    if (!this.clients) throw new Error('MongoDB bağlantısı yok');
    
    const client = await this.clients.findOne({ id }) as unknown as Client;
    return client;
  }

  public async updateClient(id: number, clientData: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client | null> {
    if (!this.clients) throw new Error('MongoDB bağlantısı yok');
    
    const now = new Date();
    const updatedData = {
      ...clientData,
      updatedAt: now
    };
    
    const result = await this.clients.findOneAndUpdate(
      { id },
      { $set: updatedData },
      { returnDocument: 'after' }
    );
    
    return result?.value as unknown as Client | null;
  }

  public async deleteClient(id: number): Promise<Client | null> {
    if (!this.clients) throw new Error('MongoDB bağlantısı yok');
    
    const result = await this.clients.findOneAndDelete({ id });
    return result?.value as unknown as Client | null;
  }
}

export default MongoDB.getInstance();
