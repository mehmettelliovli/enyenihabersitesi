import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { News } from '../../entities/news.entity';
import { Category } from '../../entities/category.entity';
import { UserRole } from '../../entities/role.enum';
import * as bcrypt from 'bcrypt';

export const initialSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const newsRepository = dataSource.getRepository(News);

  // Kategoriler
  const categories = await categoryRepository.save([
    { name: 'Teknoloji', isActive: true },
    { name: 'Spor', isActive: true },
    { name: 'Ekonomi', isActive: true },
    { name: 'Sağlık', isActive: true },
    { name: 'Kültür Sanat', isActive: true }
  ]);

  // Super Admin
  const superAdminPassword = await bcrypt.hash('mehmet61', 10);
  let superAdmin = await userRepository.findOne({
    where: { email: 'mehmet_developer@hotmail.com' }
  });

  if (superAdmin) {
    // Mevcut kullanıcıyı güncelle
    superAdmin.password = superAdminPassword;
    superAdmin.role = UserRole.SUPER_ADMIN;
    superAdmin.fullName = 'Mehmet Admin';
    superAdmin.bio = 'Sistem yöneticisi';
    superAdmin.isActive = true;
    superAdmin = await userRepository.save(superAdmin);
  } else {
    // Yeni kullanıcı oluştur
    superAdmin = await userRepository.save({
      email: 'mehmet_developer@hotmail.com',
      password: superAdminPassword,
      fullName: 'Mehmet Admin',
      role: UserRole.SUPER_ADMIN,
      bio: 'Sistem yöneticisi',
      isActive: true
    });
  }

  // Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  let admin = await userRepository.findOne({
    where: { email: 'admin@example.com' }
  });

  if (admin) {
    admin.password = adminPassword;
    admin.role = UserRole.ADMIN;
    admin.fullName = 'Site Yöneticisi';
    admin.bio = 'Site içerik yöneticisi';
    admin.isActive = true;
    admin = await userRepository.save(admin);
  } else {
    admin = await userRepository.save({
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Site Yöneticisi',
      role: UserRole.ADMIN,
      bio: 'Site içerik yöneticisi',
      isActive: true
    });
  }

  // Yazarlar
  const authorEmails = ['yazar1@example.com', 'yazar2@example.com'];
  const authorNames = ['Ali Yazar', 'Ayşe Yazar'];
  const authorBios = ['Teknoloji ve bilim yazarı', 'Sağlık ve yaşam yazarı'];
  const authors = [];

  for (let i = 0; i < authorEmails.length; i++) {
    let author = await userRepository.findOne({
      where: { email: authorEmails[i] }
    });

    if (author) {
      author.password = await bcrypt.hash('yazar123', 10);
      author.role = UserRole.AUTHOR;
      author.fullName = authorNames[i];
      author.bio = authorBios[i];
      author.isActive = true;
      author = await userRepository.save(author);
    } else {
      author = await userRepository.save({
        email: authorEmails[i],
        password: await bcrypt.hash('yazar123', 10),
        fullName: authorNames[i],
        role: UserRole.AUTHOR,
        bio: authorBios[i],
        isActive: true
      });
    }
    authors.push(author);
  }

  // Haberler
  const existingNews = await newsRepository.find();
  if (existingNews.length === 0) {
    await newsRepository.save([
      {
        title: 'Yapay Zeka Teknolojisinde Yeni Gelişme',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        imageUrl: 'https://picsum.photos/800/400',
        category: categories[0],
        author: authors[0],
        viewCount: 150,
        isActive: true
      },
      {
        title: 'Sağlıklı Yaşam İçin Öneriler',
        content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        imageUrl: 'https://picsum.photos/800/400',
        category: categories[3],
        author: authors[1],
        viewCount: 120,
        isActive: true
      },
      {
        title: 'Ekonomide Son Gelişmeler',
        content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        imageUrl: 'https://picsum.photos/800/400',
        category: categories[2],
        author: authors[0],
        viewCount: 200,
        isActive: true
      }
    ]);
  }
}; 