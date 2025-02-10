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
    // Kategoriler
    const categories = await this.createCategories();
    
    // Test kullanıcıları
    const users = await this.createUsers();
    
    // Haberler
    await this.createNews(users, categories);
    
    console.log('Seed tamamlandı!');
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
        email: 'yazar1@example.com',
        password: 'password123',
        fullName: 'Ahmet Yazar',
        role: UserRole.AUTHOR
      },
      {
        email: 'yazar2@example.com',
        password: 'password123',
        fullName: 'Ayşe Editör',
        role: UserRole.EDITOR
      },
      {
        email: 'yazar3@example.com',
        password: 'password123',
        fullName: 'Mehmet Muhabir',
        role: UserRole.AUTHOR
      }
    ];

    const savedUsers = [];
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

        savedUsers.push(user);
      } else {
        savedUsers.push(existingUser);
      }
    }

    return savedUsers;
  }

  private async createNews(users: User[], categories: Category[]) {
    const news = [
      {
        title: 'Yapay Zeka Teknolojisinde Çığır Açan Gelişme',
        content: 'Bilim insanları, insan beyninin çalışma prensiplerini taklit eden yeni bir yapay zeka modeli geliştirdi. Bu gelişme, yapay zekanın geleceği için önemli bir adım olarak görülüyor.',
        author: users[0],
        category: categories[0],
        imageUrl: 'https://picsum.photos/800/400?random=1'
      },
      {
        title: 'Süper Lig\'de Şampiyonluk Yarışı Kızışıyor',
        content: 'Ligin son haftalarına girilirken şampiyonluk yarışı büyük heyecana sahne oluyor. Takımlar arasındaki puan farkı giderek kapanıyor.',
        author: users[1],
        category: categories[1],
        imageUrl: 'https://picsum.photos/800/400?random=2'
      },
      {
        title: 'Ekonomide Yeni Dönem Başlıyor',
        content: 'Merkez Bankası\'nın aldığı son kararlar sonrasında ekonomide yeni bir dönemin kapıları aralanıyor. Uzmanlar gelişmeleri değerlendirdi.',
        author: users[2],
        category: categories[2],
        imageUrl: 'https://picsum.photos/800/400?random=3'
      },
      {
        title: 'Sağlıklı Yaşam İçin Önemli İpuçları',
        content: 'Uzmanlar, günlük hayatta uygulayabileceğimiz basit ama etkili sağlık önerilerini paylaştı. İşte sağlıklı bir yaşam için altın değerinde tavsiyeler.',
        author: users[0],
        category: categories[3],
        imageUrl: 'https://picsum.photos/800/400?random=4'
      }
    ];

    for (const newsItem of news) {
      const existingNews = await this.newsRepository.findOne({
        where: { title: newsItem.title }
      });

      if (!existingNews) {
        await this.newsRepository.save({
          ...newsItem,
          isActive: true
        });
      }
    }
  }
} 