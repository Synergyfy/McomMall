import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdminRole } from './entities/admin-role.entity';
import { User } from '../users/entities/user.entity';
import { CreateAdminRoleDto } from './dto/create-admin-role.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';

export interface AdminRoleWithCount extends AdminRole {
  memberCount: number;
}

@Injectable()
export class AdminRolesService {
  constructor(
    @InjectRepository(AdminRole)
    private readonly roleRepository: Repository<AdminRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateAdminRoleDto): Promise<AdminRole> {
    const existing = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }
    const role = this.roleRepository.create({
      ...dto,
      permissions: dto.permissions ?? [],
    });
    return this.roleRepository.save(role);
  }

  async findAll(): Promise<AdminRoleWithCount[]> {
    const roles = await this.roleRepository.find({ order: { name: 'ASC' } });
    if (roles.length === 0) return [];
    // Single batched count query grouped in memory (no N+1)
    const roleIds = roles.map((r) => r.id);
    const members = await this.userRepository.find({
      where: { adminRoleId: In(roleIds) },
      select: ['id', 'adminRoleId'],
    });
    const counts = new Map<string, number>();
    for (const m of members) {
      if (m.adminRoleId) counts.set(m.adminRoleId, (counts.get(m.adminRoleId) ?? 0) + 1);
    }
    return roles.map((r) => ({ ...r, memberCount: counts.get(r.id) ?? 0 }));
  }

  async findOne(id: string): Promise<AdminRole> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Admin role with ID ${id} was not found`);
    }
    return role;
  }

  async getMembers(id: string): Promise<User[]> {
    await this.findOne(id);
    return this.userRepository.find({
      where: { adminRoleId: id },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateAdminRoleDto): Promise<AdminRole> {
    const role = await this.findOne(id);
    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException(`Role "${dto.name}" already exists`);
      }
    }
    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async assignMember(roleId: string, userId: string | null): Promise<User> {
    await this.findOne(roleId);
    if (userId === null) {
      throw new NotFoundException('userId is required to assign a member');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} was not found`);
    }
    user.adminRoleId = roleId;
    return this.userRepository.save(user);
  }

  async unassignMember(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} was not found`);
    }
    user.adminRoleId = null;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
