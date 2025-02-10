export enum UserRole {
  SUPER_ADMIN = 1000,    // Tüm yetkilere sahip
  ADMIN = 900,          // Genel yönetici
  EDITOR = 800,         // İçerik editörü
  AUTHOR = 700,         // Yazar
  MODERATOR = 600,      // İçerik moderatörü
  USER = 100            // Normal kullanıcı
} 