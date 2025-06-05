// Veritabanı yerine geçici olarak kullanılacak bellek tabanlı veri saklama

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  status: string;
  due_date: string;
  created_at: string;
}

export interface Client {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
  tax_number: string;
  website: string;
  notes: string;
  is_active: boolean;
  logo: string;
  monthly_income: number;
  payment_status: string;
  last_payment_date: string;
  created_at: string;
  updated_at: string;
}

export class MemoryDB {
  private users: User[] = [];
  private tasks: Task[] = [];
  private clients: Client[] = [];
  private userIdCounter = 1;
  private taskIdCounter = 1;
  private clientIdCounter = 1;

  // User methods
  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find(user => user.email === email);
    return user || null;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return [...this.clients];
  }

  async getClientById(id: number): Promise<Client | null> {
    const client = this.clients.find(client => client.id === id);
    return client || null;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.find(task => task.id === id);
  }

  // Kullanıcı işlemleri
  async createUser(email: string, password_hash: string, name: string, role: string): Promise<User> {
    // E-posta kontrolü
    const existingUser = this.users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor.');
    }

    const newUser: User = {
      id: this.userIdCounter++,
      email,
      password_hash,
      name,
      role,
      created_at: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }



  // Görev işlemleri
  async createTask(title: string, description: string, assigned_to: number, due_date: string): Promise<Task> {
    const newTask: Task = {
      id: this.taskIdCounter++,
      title,
      description,
      assigned_to,
      status: 'yeni',
      due_date,
      created_at: new Date().toISOString()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  async listTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return this.tasks.filter(task => task.assigned_to === userId);
  }

  // Müşteri işlemleri
  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const now = new Date().toISOString();
    
    const newClient: Client = {
      id: this.clientIdCounter++,
      ...clientData,
      created_at: now,
      updated_at: now
    };

    this.clients.push(newClient);
    return newClient;
  }

  async listClients(): Promise<Client[]> {
    return this.clients;
  }



  async updateClient(id: number, clientData: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<Client | null> {
    const index = this.clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const updatedClient = {
      ...this.clients[index],
      ...clientData,
      updated_at: new Date().toISOString()
    };
    
    this.clients[index] = updatedClient;
    return updatedClient;
  }

  async deleteClient(id: number): Promise<Client | null> {
    const index = this.clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      return null;
    }
    
    const deletedClient = this.clients[index];
    this.clients.splice(index, 1);
    return deletedClient;
  }
}

// Singleton instance
const memoryDB = new MemoryDB();
export default memoryDB;
