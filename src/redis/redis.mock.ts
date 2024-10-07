/* eslint-disable @typescript-eslint/no-unused-vars */
export class RedisServiceMock {
  private blacklist = new Set<string>();

  async addTokenToBlacklist(token: string, expiresIn: number): Promise<void> {
    this.blacklist.add(token);
  }
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklist.has(token);
  }
}
