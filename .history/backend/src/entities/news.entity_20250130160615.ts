import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('news')
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  category: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => User, user => user.news)
  author: User;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('text', { array: true, default: [] })
  tags: string[];
} 