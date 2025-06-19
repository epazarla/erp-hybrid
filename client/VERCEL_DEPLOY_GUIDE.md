# Vercel Deployment Guide

Bu rehber, ERP uygulamanızı Vercel'de güvenli bir şekilde dağıtmak için gerekli adımları içerir.

## Ortam Değişkenleri Yapılandırması

Vercel'de hassas bilgilerinizi güvenli bir şekilde yönetmek için aşağıdaki ortam değişkenlerini ayarlamanız gerekiyor:

1. Vercel Dashboard'a giriş yapın: https://vercel.com/dashboard
2. Projenizi seçin
3. "Settings" sekmesine tıklayın
4. "Environment Variables" bölümüne gidin
5. Aşağıdaki ortam değişkenlerini ekleyin:

| İsim | Değer | Ortam |
|------|-------|-------|
| `POSTGRES_PASSWORD` | `0M0Ock9yemyzsz80` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://zapavervgikfsmgrvjtu.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

## Yeniden Dağıtım

Ortam değişkenlerini ekledikten sonra, projenizi yeniden dağıtmanız gerekir:

1. Vercel Dashboard'da projenize gidin
2. "Deployments" sekmesine tıklayın
3. "Redeploy" butonuna tıklayın (veya yeni bir commit yapın)

## Güvenlik Notları

- Bu rehberdeki şifre ve anahtar bilgileri hassastır. Bu dosyayı GitHub'a göndermeyin.
- Üretim ortamında daha güçlü şifreler kullanmayı düşünün.
- Vercel'in ortam değişkenleri şifrelenmiş olarak saklanır ve güvenlidir.

## Bağlantı Testi

Dağıtım tamamlandıktan sonra, uygulamanızın Supabase'e başarıyla bağlanıp bağlanmadığını kontrol edin. Herhangi bir sorun yaşarsanız, Vercel loglarını kontrol edin.
