import { Repository, DeepPartial } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { RolesService } from '../roles/roles.service';
export declare class UsersService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly rolesService;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, rolesService: RolesService);
    findAll(): Promise<Partial<User>[]>;
    findOne(id: number): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    getRolesByIds(roleIds: number[]): Promise<Role[]>;
    getRoleByName(name: string): Promise<Role | null>;
    create(userData: DeepPartial<User>): Promise<User>;
    update(id: number, userData: any): Promise<User>;
    updateRoles(id: number, roleIds: number[]): Promise<User>;
    remove(id: number): Promise<void>;
}
