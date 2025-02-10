import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { News } from './news.entity';
import { UserRole } from './role.enum';
import { UserRoleMapping } from './user-role-mapping.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => News, news => news.author)
  news: News[];

  @OneToMany(() => UserRoleMapping, userRoleMapping => userRoleMapping.user)
  userRoleMappings: UserRoleMapping[];
} 