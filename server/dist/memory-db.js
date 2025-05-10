"use strict";
// Veritabanı yerine geçici olarak kullanılacak bellek tabanlı veri saklama
Object.defineProperty(exports, "__esModule", { value: true });
class MemoryDB {
    constructor() {
        this.users = [];
        this.tasks = [];
        this.clients = [];
        this.userIdCounter = 1;
        this.taskIdCounter = 1;
        this.clientIdCounter = 1;
    }
    // Yedekleme ve geri yükleme için yardımcı fonksiyonlar
    // Kullanıcı işlemleri
    async createUser(email, password_hash, name, role) {
        // E-posta kontrolü
        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            throw new Error('Bu e-posta adresi zaten kullanılıyor.');
        }
        const newUser = {
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
    async getUserByEmail(email) {
        const user = this.users.find(user => user.email === email);
        return user || null;
    }
    // Görev işlemleri
    async createTask(title, description, assigned_to, due_date) {
        const newTask = {
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
    async listTasks() {
        return this.tasks;
    }
    async getTasksByUser(userId) {
        return this.tasks.filter(task => task.assigned_to === userId);
    }
    // Müşteri işlemleri
    async createClient(clientData) {
        const now = new Date().toISOString();
        const newClient = {
            id: this.clientIdCounter++,
            ...clientData,
            created_at: now,
            updated_at: now
        };
        this.clients.push(newClient);
        return newClient;
    }
    async listClients() {
        return this.clients;
    }
    async getClientById(id) {
        const client = this.clients.find(client => client.id === id);
        return client || null;
    }
    async updateClient(id, clientData) {
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
    async deleteClient(id) {
        const index = this.clients.findIndex(client => client.id === id);
        if (index === -1) {
            return null;
        }
        const deletedClient = this.clients[index];
        this.clients.splice(index, 1);
        return deletedClient;
    }
    // Yedekleme ve geri yükleme işlemleri
    async listUsers() {
        return this.users;
    }
    async restoreUsers(users) {
        this.users = users;
        // ID sayacını güncelle
        if (users.length > 0) {
            const maxId = Math.max(...users.map(user => user.id));
            this.userIdCounter = maxId + 1;
        }
    }
    async restoreTasks(tasks) {
        this.tasks = tasks;
        // ID sayacını güncelle
        if (tasks.length > 0) {
            const maxId = Math.max(...tasks.map(task => task.id));
            this.taskIdCounter = maxId + 1;
        }
    }
    async restoreClients(clients) {
        this.clients = clients;
        // ID sayacını güncelle
        if (clients.length > 0) {
            const maxId = Math.max(...clients.map(client => client.id));
            this.clientIdCounter = maxId + 1;
        }
    }
}
// Singleton instance
const memoryDB = new MemoryDB();
exports.default = memoryDB;
