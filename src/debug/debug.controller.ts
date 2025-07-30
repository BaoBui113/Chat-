import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('debug')
export class DebugController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get('database-info')
  async getDatabaseInfo() {
    try {
      // Get database connection info
      const options = this.dataSource.options as any;
      const dbInfo = {
        isConnected: this.dataSource.isInitialized,
        database: options.database,
        host: options.host,
        port: options.port,
        username: options.username,
      };

      // Get all tables in the database
      const tables = await this.dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      // Check if users table exists specifically
      const usersTableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);

      // Get users table structure if exists
      let usersTableStructure = null;
      if (usersTableExists[0].exists) {
        usersTableStructure = await this.dataSource.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'users'
          ORDER BY ordinal_position;
        `);
      }

      return {
        connection: dbInfo,
        allTables: tables,
        usersTableExists: usersTableExists[0].exists,
        usersTableStructure,
      };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }

  @Get('create-user-table')
  async createUserTable() {
    try {
      // Force sync the User entity
      await this.dataSource.synchronize();
      return { message: 'Database synchronized successfully' };
    } catch (error) {
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }
}
