import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userReposity: Repository<User>,
  ) {}
  create(user: Partial<User>): Promise<User> {
    const newUser = this.userReposity.create(user);
    return this.userReposity.save(newUser);
  }
  findAll(): Promise<User[]> {
    return this.userReposity.find();
  }
  findOne(id: number): Promise<User> {
    return this.userReposity.findOneBy({ id });
  }
  findByUsername(name: string): Promise<User | null> {
    return this.userReposity.findOneBy({ name });
  }
  async update(id: number, user: Partial<User>): Promise<User> {
    await this.userReposity.update(id, user);
    return this.findOne(id);
  }
  async remove(id: number): Promise<void> {
    await this.userReposity.delete(id);
  }
}
