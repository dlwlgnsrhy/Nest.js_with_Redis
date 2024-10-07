/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../database/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findAll: jest.fn(),
    findByName: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test_token'),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should validate user successfully', async () => {
    const user = { id: 1, name: 'Alice', password: 'hashed_password' };
    mockUsersService.findByName.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await authService.validateUser('Alice', '');
    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  it('should fail to validate user with wrong password', async () => {
    const user = { id: 1, name: 'Alice', password: 'hashed_password' };
    mockUsersService.findByName.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const result = await authService.validateUser('Alice', 'wrongpassword');
    expect(result).toBeNull();
  });

  it('should return JWT token on login', async () => {
    const user = { id: 1, name: 'Alice' };
    const result = await authService.login(user);
    expect(result).toEqual({ access_token: 'test_token' });
  });
});
