"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
const bcrypt = require("bcryptjs");
const roles_service_1 = require("../roles/roles.service");
let UsersService = class UsersService {
    constructor(userRepository, roleRepository, rolesService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.rolesService = rolesService;
    }
    async findAll() {
        return this.userRepository.find({
            select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'createdAt'],
            relations: ['roles']
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'fullName', 'email', 'profileImage', 'bio', 'createdAt'],
            relations: ['roles']
        });
        if (!user) {
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email, isActive: true },
            relations: ['roles']
        });
    }
    async getRolesByIds(roleIds) {
        if (!roleIds || !roleIds.length) {
            return [];
        }
        return this.roleRepository.findByIds(roleIds);
    }
    async getRoleByName(name) {
        return this.roleRepository.findOne({ where: { name } });
    }
    async create(userData) {
        const { roleIds, ...rest } = userData;
        let roles = [];
        if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
            roles = await this.getRolesByIds(roleIds);
            if (!roles.length) {
                throw new common_1.NotFoundException('Seçilen roller bulunamadı');
            }
        }
        else {
            const userRole = await this.getRoleByName('USER');
            if (userRole) {
                roles = [userRole];
            }
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userToCreate = {
            ...rest,
            password: hashedPassword,
            roles,
            isActive: true
        };
        const newUser = this.userRepository.create(userToCreate);
        return await this.userRepository.save(newUser);
    }
    async update(id, userData) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles']
        });
        if (!user) {
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        }
        if (userData.roleIds) {
            const roles = await this.roleRepository.findByIds(userData.roleIds);
            if (!roles.length) {
                throw new common_1.NotFoundException('Seçilen roller bulunamadı');
            }
            user.roles = roles;
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        Object.assign(user, userData);
        return this.userRepository.save(user);
    }
    async updateRoles(id, roleIds) {
        const user = await this.findOne(id);
        const roles = await Promise.all(roleIds.map(roleId => this.rolesService.findById(roleId)));
        user.roles = roles.filter(role => role !== null);
        return this.userRepository.save(user);
    }
    async remove(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['roles']
        });
        if (!user) {
            throw new common_1.NotFoundException('Kullanıcı bulunamadı');
        }
        await this.userRepository.remove(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        roles_service_1.RolesService])
], UsersService);
//# sourceMappingURL=users.service.js.map