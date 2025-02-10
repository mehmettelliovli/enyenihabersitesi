import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
export declare class RolesService {
    private readonly roleRepository;
    constructor(roleRepository: Repository<Role>);
    findAll(): Promise<Role[]>;
    findById(id: number): Promise<Role>;
}
