-- ERP Veritabanı Tabloları

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  permissions JSON,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Müşteriler Tablosu
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(100),
  sector VARCHAR(50),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  payment_status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Görevler Tablosu
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to VARCHAR(36),
  created_by VARCHAR(36),
  due_date DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Varsayılan Kullanıcıları Ekle
INSERT INTO users (id, email, password, name, role, department, phone, avatar_url, status, permissions)
VALUES
  ('1', 'ismail@admin.com', 'mikkel56M', 'İsmail Admin', 'Admin', 'Yönetim', '+90 555 123 4567', 'https://i.pravatar.cc/150?img=1', 'active', '{"admin": true, "canManageUsers": true, "canManageClients": true, "canManageTasks": true}'),
  ('2', 'ibrahim@epazarla.com', 'Ibrahim123', 'İbrahim Yıldırım', 'Satış Müdürü', 'Satış', '+90 555 234 5678', 'https://i.pravatar.cc/150?img=2', 'active', '{"canManageClients": true, "canManageTasks": true}'),
  ('3', 'fatih@epazarla.com', 'Fatih123', 'Fatih Dikmen', 'Pazarlama Uzmanı', 'Pazarlama', '+90 555 345 6789', 'https://i.pravatar.cc/150?img=3', 'active', '{"canManageClients": true, "canManageTasks": true}'),
  ('4', 'eda@epazarla.com', 'Eda123', 'Eda Köran', 'İK Uzmanı', 'İnsan Kaynakları', '+90 555 456 7890', 'https://i.pravatar.cc/150?img=4', 'active', '{"canManageUsers": true, "canManageTasks": true}'),
  ('5', 'ahmet@epazarla.com', 'Ahmet123', 'Ahmet Yağcıoğlu', 'Muhasebe Uzmanı', 'Muhasebe', '+90 555 567 8901', 'https://i.pravatar.cc/150?img=5', 'active', '{"canManageClients": true, "canManageTasks": true}');
