import { DataSource } from 'typeorm';
import { User } from '../../entities/user.entity';
import { News } from '../../entities/news.entity';
import { Category } from '../../entities/category.entity';
import { Role } from '../../entities/role.entity';
import * as bcrypt from 'bcrypt';

export const initialSeed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const newsRepository = dataSource.getRepository(News);
  const roleRepository = dataSource.getRepository(Role);

  // Kategoriler
  const categories = await categoryRepository.save([
    { name: 'Teknoloji', isActive: true },
    { name: 'Spor', isActive: true },
    { name: 'Ekonomi', isActive: true },
    { name: 'Sağlık', isActive: true },
    { name: 'Kültür Sanat', isActive: true }
  ]);

  // Rolleri oluştur
  const superAdminRole = await roleRepository.findOne({ where: { name: 'SUPER_ADMIN' } });
  const adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
  const authorRole = await roleRepository.findOne({ where: { name: 'AUTHOR' } });

  // Super Admin oluştur
  const superAdminExists = await userRepository.findOne({
    where: { email: 'superadmin@example.com' }
  });

  if (!superAdminExists) {
    const superAdmin = new User();
    superAdmin.email = 'superadmin@example.com';
    superAdmin.fullName = 'Super Admin';
    superAdmin.password = await bcrypt.hash('superadmin123', 10);
    superAdmin.roles = [superAdminRole];
    await userRepository.save(superAdmin);
  }

  // Admin oluştur
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@example.com' }
  });

  if (!adminExists) {
    const admin = new User();
    admin.email = 'admin@example.com';
    admin.fullName = 'Admin User';
    admin.password = await bcrypt.hash('admin123', 10);
    admin.roles = [adminRole];
    await userRepository.save(admin);
  }

  // Test yazarları oluştur
  const authors = [
    {
      email: 'author1@example.com',
      fullName: 'Yazar Bir',
      password: 'author123'
    },
    {
      email: 'author2@example.com',
      fullName: 'Yazar İki',
      password: 'author123'
    }
  ];

  for (const authorData of authors) {
    const authorExists = await userRepository.findOne({
      where: { email: authorData.email }
    });

    if (!authorExists) {
      const author = new User();
      author.email = authorData.email;
      author.fullName = authorData.fullName;
      author.password = await bcrypt.hash(authorData.password, 10);
      author.roles = [authorRole];
      await userRepository.save(author);
    }
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