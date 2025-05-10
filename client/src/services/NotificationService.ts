// Bildirim sistemi - ses özelliği eklendi

// Bildirim türleri
export enum NotificationType {
  DEFAULT = 'default',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  TASK = 'task',
  MESSAGE = 'message'
}

// Bildirim ses türleri
export enum NotificationSoundType {
  NONE = 'none',
  BELL = 'bell',
  CHIME = 'chime',
  ALERT = 'alert',
  NOTIFICATION = 'notification',
  PING = 'ping'
}

// Bildirim ayarları arayüzü
export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  soundVolume: number;
  desktop: boolean;
  soundType: NotificationSoundType;
}

class NotificationService {
  private settings: NotificationSettings = {
    enabled: true,
    sound: true, // Ses aktif hale getirildi
    soundVolume: 0.7,
    desktop: true,
    soundType: NotificationSoundType.BELL
  };
  
  // Ses servisi referansı
  private soundService: any = null;

  constructor() {
    // Tarayıcı ortamında çalışıyorsa bildirim ayarlarını yükle
    if (typeof window !== 'undefined') {
      // Yerel depolamadan bildirim ayarlarını al
      const storedSettings = localStorage.getItem('notification_settings');
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          this.settings = { ...this.settings, ...parsedSettings };
        } catch (error) {
          console.error('Bildirim ayarları yüklenemedi:', error);
          // Hata durumunda varsayılan ayarları kaydet
          this.saveSettings();
        }
      } else {
        // İlk kez çalıştırılıyorsa ayarları kaydet
        this.saveSettings();
      }
      
      // Ses servisini yükle
      try {
        this.soundService = require('./SoundService').default;
      } catch (error) {
        console.error('Ses servisi yüklenemedi:', error);
      }
    }
  }

  // Bildirim sesi çal
  playNotificationSound(soundType: NotificationSoundType = NotificationSoundType.BELL): void {
    if (!this.settings.sound || soundType === NotificationSoundType.NONE) return;
    
    try {
      // SoundService'i kullanarak sesi çal (eğer yüklendiyse)
      if (this.soundService) {
        this.soundService.playSound(soundType, this.settings.soundVolume);
      } else {
        console.log('Ses servisi henüz yüklenmedi');
        // Tekrar yüklemeyi dene
        try {
          this.soundService = require('./SoundService').default;
          if (this.soundService) {
            this.soundService.playSound(soundType, this.settings.soundVolume);
          }
        } catch (error) {
          console.error('Ses servisi yükleme hatası:', error);
        }
      }
    } catch (error) {
      console.error('Ses çalma hatası:', error);
    }
  }

  // Bildirim göster
  showNotification(
    title: string, 
    body: string, 
    options: {
      type?: NotificationType,
      icon?: string,
      onClick?: () => void,
      playSound?: boolean
    } = {}
  ): void {
    if (!this.settings.enabled) return;
    
    // Konsola bildirim göster
    console.log(`[${options.type || 'DEFAULT'}] ${title}: ${body}`);
    
    // Bildirim sesi çal (eğer aktifse ve açıkça kapatılmamışsa)
    if (options.playSound !== false && this.settings.sound) {
      this.playNotificationSound(this.settings.soundType);
    }
    
    // Bildirim izni varsa bildirim göster
    if (this.settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: options.icon || '/logo.png'
      });
      
      if (options.onClick) {
        notification.onclick = () => {
          window.focus();
          options.onClick?.();
          notification.close();
        };
      }
    }
  }

  // Bildirim oluştur - kaldırıldı (showNotification içine taşındı)

  // Bildirim ayarlarını güncelle - basitleştirildi
  updateSettings(settings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
  }
  
  // Ayarları kaydet
  private saveSettings(): void {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  // Bildirim ayarlarını al
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
  
  // Bildirim durumunu al
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Bildirim izinlerini iste
  requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('denied');
  }
  
  // Bildirim sesi test et
  testSound(soundType: NotificationSoundType = NotificationSoundType.BELL): void {
    // Ses ayarları kapalı olsa bile test için çal
    try {
      // SoundService'i kullanarak sesi çal (eğer yüklendiyse)
      if (this.soundService) {
        this.soundService.playSound(soundType, this.settings.soundVolume);
      } else {
        console.log('Ses servisi henüz yüklenmedi');
        // Tekrar yüklemeyi dene
        try {
          this.soundService = require('./SoundService').default;
          if (this.soundService) {
            this.soundService.playSound(soundType, this.settings.soundVolume);
          }
        } catch (error) {
          console.error('Ses servisi yükleme hatası:', error);
        }
      }
    } catch (error) {
      console.error('Ses testi hatası:', error);
    }
  }

  // Bildirim izin durumunu al
  getPermissionStatus(): NotificationPermission | null {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return null;
  }
}

// Singleton örneği oluştur
const notificationService = new NotificationService();
export default notificationService;
