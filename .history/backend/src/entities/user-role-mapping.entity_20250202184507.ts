import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './role.enum';

@Entity()
export class UserRoleMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.roleMappings, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  grantedBy: number; // Rolü veren kullanıcının ID'si
} 