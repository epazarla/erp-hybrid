// Test kullanıcı bilgileri
const testUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    email: 'test@example.com',
    password: '123456',
    role: 'user'
  }
];

console.log('Kullanılabilir test kullanıcıları:');
console.table(testUsers);

console.log('\nGiriş için yukarıdaki kullanıcı bilgilerini kullanabilirsiniz.');
console.log('Eğer bu kullanıcılar çalışmazsa, veritabanında yeni bir kullanıcı oluşturmanız gerekebilir.');
