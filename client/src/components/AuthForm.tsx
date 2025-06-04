import React, { useState } from 'react';
import { registerUser, CURRENT_USER_STORAGE_KEY, USER_STATUS } from '../services/UserService';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'kullanici',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        // Giriş işlemi
        const users = JSON.parse(localStorage.getItem('erp_users_v2') || '[]');
        const user = users.find((u: any) => 
          u.email.toLowerCase() === form.email.toLowerCase() && 
          u.password === form.password
        );
        
        if (!user) {
          throw new Error('E-posta veya şifre hatalı.');
        }
        
        // Kullanıcı aktif değilse giriş yapamaz
        if (user.status !== 'active' && user.status !== USER_STATUS.ACTIVE) {
          throw new Error('Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
        }
        
        // Giriş başarılı
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
        onAuthSuccess(user);
      } else {
        // Kayıt işlemi
        if (!form.name.trim()) {
          throw new Error('Ad Soyad alanı boş bırakılamaz.');
        }
        
        if (!form.email.trim()) {
          throw new Error('E-posta alanı boş bırakılamaz.');
        }
        
        if (!form.password.trim() || form.password.length < 6) {
          throw new Error('Şifre en az 6 karakter olmalıdır.');
        }
        
        // Kullanıcı kayıt işlemi - localStorage'a doğrudan kaydedelim
        const users = JSON.parse(localStorage.getItem('erp_users_v2') || '[]');
        
        // E-posta kontrolü
        const existingUser = users.find((u: any) => u.email.toLowerCase() === form.email.toLowerCase());
        if (existingUser) {
          throw new Error('Bu e-posta adresi zaten kullanılıyor.');
        }
        
        // Yeni kullanıcı ID'si
        const maxId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) : 0;
        
        // Yeni kullanıcı oluştur
        const newUser = {
          id: maxId + 1,
          name: form.name,
          email: form.email,
          password: form.password, // Şifre ekledik
          role: form.role,
          department: form.role === 'admin' ? 'Yönetim' : 'Genel',
          isActive: true,
          status: 'active',
          created_at: new Date().toISOString()
        };
        
        // Kullanıcıyı kaydet
        users.push(newUser);
        localStorage.setItem('erp_users_v2', JSON.stringify(users));
        
        // Kayıt başarılı, otomatik giriş yap
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
        onAuthSuccess(newUser);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="kullanici">Kullanıcı</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Gönderiliyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </button>
      </form>
      <div className="switch-mode">
        {mode === 'login' ? (
          <span>
            Hesabın yok mu?{' '}
            <button type="button" onClick={() => setMode('register')}>
              Kayıt Ol
            </button>
          </span>
        ) : (
          <span>
            Zaten hesabın var mı?{' '}
            <button type="button" onClick={() => setMode('login')}>
              Giriş Yap
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
