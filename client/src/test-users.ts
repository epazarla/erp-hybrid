import { supabase } from './lib/supabase';

// Kullanıcıları listele
const listUsers = async () => {
  try {
    console.log('Kullanıcılar sorgulanıyor...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(10);
      
    if (error) {
      console.error('Kullanıcı sorgulama hatası:', error);
      return;
    }
    
    console.log('Bulunan kullanıcı sayısı:', data?.length || 0);
    console.log('Kullanıcılar:', data);
    
    // Test kullanıcısı oluştur
    if (!data || data.length === 0) {
      console.log('Test kullanıcısı oluşturuluyor...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            name: 'Test Kullanıcı',
            email: 'test@example.com',
            password: '123456',
            role: 'admin',
            status: 'active',
            approval_status: 'approved',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
        
      if (createError) {
        console.error('Kullanıcı oluşturma hatası:', createError);
      } else {
        console.log('Test kullanıcısı oluşturuldu:', newUser);
      }
    }
  } catch (error) {
    console.error('İşlem hatası:', error);
  }
};

// Fonksiyonu çalıştır
listUsers();

export {};
