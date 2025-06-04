// Basit ses servisi
type SoundType = 'none' | 'bell' | 'chime' | 'alert' | 'notification' | 'ping';

// Ses dosyaları yerine basit beep sesi kullanalım
const beepSound = () => {
  try {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      context.close();
    }, 200);
    
    return true;
  } catch (error) {
    console.error('Ses çalma hatası:', error);
    return false;
  }
};

// Basit ses servisi sınıfı
class SoundService {
  // Ses çal - herhangi bir tür için basit beep sesi çalıyor
  playSound(type: string, volume: number = 0.7): void {
    if (type === 'none') return;
    beepSound();
  }
}

// Tekil örnek
const soundService = new SoundService();
export default soundService;
