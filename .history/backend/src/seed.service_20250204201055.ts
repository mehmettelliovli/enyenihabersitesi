import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { News } from './entities/news.entity';
import { Category } from './entities/category.entity';
import { UserRoleMapping } from './entities/user-role-mapping.entity';
import { UserRole } from './entities/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(News)
    private readonly newsRepository: Repository<News>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(UserRoleMapping)
    private readonly userRoleMappingRepository: Repository<UserRoleMapping>,
  ) {}

  async seed() {
    await this.createUsers();
    const categories = await this.createCategories();
    const users = await this.userRepository.find();
    await this.createNews(users, categories);
    console.log('Seed completed successfully!');
  }

  private async createCategories() {
    const categories = [
      { name: 'Teknoloji', description: 'Teknoloji haberleri' },
      { name: 'Spor', description: 'Spor haberleri' },
      { name: 'Ekonomi', description: 'Ekonomi haberleri' },
      { name: 'Sağlık', description: 'Sağlık haberleri' },
    ];

    const savedCategories = [];
    for (const category of categories) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: category.name }
      });

      if (!existingCategory) {
        savedCategories.push(
          await this.categoryRepository.save(category)
        );
      } else {
        savedCategories.push(existingCategory);
      }
    }

    return savedCategories;
  }

  private async createUsers() {
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: UserRole.SUPER_ADMIN
      },
      {
        email: 'editor@example.com',
        password: 'editor123',
        fullName: 'Editor User',
        role: UserRole.EDITOR
      },
      {
        email: 'author@example.com',
        password: 'author123',
        fullName: 'Author User',
        role: UserRole.AUTHOR
      }
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.userRepository.save({
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          isActive: true
        });

        // Kullanıcı rolünü ata
        await this.userRoleMappingRepository.save({
          user,
          role: userData.role,
          isActive: true
        });

        console.log(`Created user: ${userData.email} with role: ${userData.role}`);
      }
    }
  }

  private async createNews(users: User[], categories: Category[]) {
    const newsItems = [
      {
        title: 'Yapay Zeka Teknolojisinde Çığır Açan Gelişme',
        content: 'Bilim insanları, insan beyninin çalışma prensiplerini taklit eden yeni bir yapay zeka modeli geliştirdi...',
        category: categories[0],
        imageUrl: 'https://picsum.photos/800/400?random=1'
      },
      {
        title: 'Süper Lig\'de Şampiyonluk Yarışı',
        content: 'Ligin son haftalarına girilirken şampiyonluk yarışı büyük heyecana sahne oluyor...',
        category: categories[1],
        imageUrl: 'https://picsum.photos/800/400?random=2'
      },
      {
        title: 'Ekonomide Yeni Dönem',
        content: 'Merkez Bankası\'nın aldığı son kararlar sonrasında ekonomide yeni bir dönem başlıyor...',
        category: categories[2],
        imageUrl: 'https://picsum.photos/800/400?random=3'
      }
    ];

    for (const [index, newsItem] of newsItems.entries()) {
      const existingNews = await this.newsRepository.findOne({
        where: { title: newsItem.title }
      });

      if (!existingNews) {
        await this.newsRepository.save({
          ...newsItem,
          author: users[index % users.length],
          isActive: true,
          viewCount: Math.floor(Math.random() * 1000)
        });
      }
    }
  }
} 