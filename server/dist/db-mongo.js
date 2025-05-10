"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// MongoDB bağlantı URL'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erp-hybrid';
// Singleton sınıfı
class MongoDB {
    constructor() {
        this.client = null;
        this.db = null;
        this.users = null;
        this.tasks = null;
        this.clients = null;
        this.isConnected = false;
    }
    // Singleton instance
    static getInstance() {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance;
    }
    // MongoDB'ye bağlan
    async connect() {
        if (this.isConnected) {
            console.log('MongoDB zaten bağlı');
            return;
        }
        try {
            this.client = new mongodb_1.MongoClient(MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db();
            // Koleksiyonları oluştur
            this.users = this.db.collection('users');
            this.tasks = this.db.collection('tasks');
            this.clients = this.db.collection('clients');
            this.isConnected = true;
            console.log('MongoDB bağlantısı başarılı');
        }
        catch (error) {
            console.error('MongoDB bağlantı hatası:', error);
            throw error;
        }
    }
    // Bağlantıyı kapat
    async close() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            console.log('MongoDB bağlantısı kapatıldı');
        }
    }
    // Kullanıcı işlemleri
    async createUser(email, password_hash, name, role) {
        if (!this.users)
            throw new Error('MongoDB bağlantısı yok');
        // E-posta kontrolü
        const existingUser = await this.users.findOne({ email });
        if (existingUser) {
            throw new Error('Bu e-posta adresi zaten kullanılıyor.');
        }
        const now = new Date();
        const newUser = {
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
    async getUserByEmail(email) {
        if (!this.users)
            throw new Error('MongoDB bağlantısı yok');
        const user = await this.users.findOne({ email });
        return user;
    }
    async listUsers() {
        if (!this.users)
            throw new Error('MongoDB bağlantısı yok');
        const users = await this.users.find().toArray();
        return users;
    }
    // Görev işlemleri
    async createTask(title, description, assigned_to, due_date) {
        if (!this.tasks)
            throw new Error('MongoDB bağlantısı yok');
        const now = new Date();
        const newTask = {
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
    async listTasks() {
        if (!this.tasks)
            throw new Error('MongoDB bağlantısı yok');
        const tasks = await this.tasks.find().toArray();
        return tasks;
    }
    async getTasksByUser(userId) {
        if (!this.tasks)
            throw new Error('MongoDB bağlantısı yok');
        const tasks = await this.tasks.find({ assigned_to: userId }).toArray();
        return tasks;
    }
    // Müşteri işlemleri
    async createClient(clientData) {
        if (!this.clients)
            throw new Error('MongoDB bağlantısı yok');
        const now = new Date();
        const newClient = {
            id: Date.now(),
            ...clientData,
            createdAt: now,
            updatedAt: now
        };
        await this.clients.insertOne(newClient);
        return newClient;
    }
    async listClients() {
        if (!this.clients)
            throw new Error('MongoDB bağlantısı yok');
        const clients = await this.clients.find().toArray();
        return clients;
    }
    async getClientById(id) {
        if (!this.clients)
            throw new Error('MongoDB bağlantısı yok');
        const client = await this.clients.findOne({ id });
        return client;
    }
    async updateClient(id, clientData) {
        if (!this.clients)
            throw new Error('MongoDB bağlantısı yok');
        const now = new Date();
        const updatedData = {
            ...clientData,
            updatedAt: now
        };
        const result = await this.clients.findOneAndUpdate({ id }, { $set: updatedData }, { returnDocument: 'after' });
        return result.value;
    }
    async deleteClient(id) {
        if (!this.clients)
            throw new Error('MongoDB bağlantısı yok');
        const result = await this.clients.findOneAndDelete({ id });
        return result.value;
    }
}
exports.default = MongoDB.getInstance();
