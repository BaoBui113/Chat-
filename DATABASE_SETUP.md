# Chat Server Setup Guide

## 🐳 Cài đặt với Docker (Khuyến nghị)

### Quick Start với Docker Compose

```bash
# Khởi động tất cả services (PostgreSQL, Redis, Kafka)
docker-compose up -d

# Hoặc sử dụng script quản lý
chmod +x docker-manager.sh
./docker-manager.sh start
```

### Services được cung cấp:

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379` (password: redis123)
- **Kafka**: `localhost:9092`
- **Kafka UI**: `http://localhost:8080`
- **pgAdmin**: `http://localhost:5050` (admin@chat.com / admin123)
- **Redis Commander**: `http://localhost:8081`

### Docker Management Commands:

```bash
# Khởi động services
./docker-manager.sh start

# Dừng services
./docker-manager.sh stop

# Restart services
./docker-manager.sh restart

# Xem logs
./docker-manager.sh logs
./docker-manager.sh logs postgres  # logs của service cụ thể

# Kiểm tra status
./docker-manager.sh status

# Dọn dẹp (remove containers và volumes)
./docker-manager.sh cleanup

# Khởi động với app
./docker-manager.sh dev
```

---

## 📦 Cài đặt thủ công (Manual Setup)

### 1. Cài đặt PostgreSQL

#### Windows:

- Tải và cài đặt PostgreSQL từ: https://www.postgresql.org/download/windows/
- Hoặc sử dụng Docker: `docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:13`

#### macOS:

```bash
# Sử dụng Homebrew
brew install postgresql
brew services start postgresql

# Hoặc sử dụng Docker
docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:13
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Cài đặt Redis

#### Windows:

```bash
# Sử dụng Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

#### macOS:

```bash
# Sử dụng Homebrew
brew install redis
brew services start redis
```

#### Linux:

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. Cài đặt Kafka

#### Docker (Khuyến nghị):

```bash
# Sử dụng docker-compose của dự án
docker-compose up -d zookeeper kafka
```

#### Manual Installation:

- Tải Kafka từ: https://kafka.apache.org/downloads
- Làm theo hướng dẫn official documentation

### 4. Tạo Database

Kết nối vào PostgreSQL và tạo database:

```sql
-- Kết nối với user postgres
psql -U postgres

-- Tạo database
CREATE DATABASE chat_db;

-- Tạo user (optional)
CREATE USER chat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chat_db TO chat_user;
```

### 4. Tạo Database

Kết nối vào PostgreSQL và tạo database:

```sql
-- Kết nối với user postgres
psql -U postgres

-- Tạo database
CREATE DATABASE chat_db;

-- Tạo user (optional)
CREATE USER chat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chat_db TO chat_user;
```

### 5. Cấu hình Environment Variables

Sao chép file `.env` và điều chỉnh các thông số:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=chat_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=chat-server

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 6. Chạy ứng dụng

```bash
# Cài đặt dependencies
npm install

# Chạy ứng dụng ở mode development
npm run start:dev

# Chạy ở production mode
npm run build
npm run start:prod
```

## Cấu trúc Database

### Entities đã được tạo:

1. **BaseEntity** (`src/entities/base.entity.ts`) - Abstract class chứa:
   - id (UUID, Primary Key)
   - createdAt (timestamp tự động)
   - updatedAt (timestamp tự động)

2. **User Entity** (`src/entities/user.entity.ts`) - Kế thừa BaseEntity:
   - username (unique)
   - email (unique)
   - password
   - avatar (nullable)
   - isActive (default: true)

### Cách sử dụng BaseEntity:

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('your_table')
export class YourEntity extends BaseEntity {
  @Column()
  yourField: string;
  // Tự động có: id, createdAt, updatedAt
}
```

## TypeORM Configuration

- **Auto Sync**: Enabled trong development mode (tự động tạo/cập nhật bảng)
- **Logging**: Enabled trong development mode
- **SSL**: Enabled trong production mode

## Troubleshooting

### Lỗi kết nối database:

1. Kiểm tra PostgreSQL service đang chạy
2. Kiểm tra thông tin kết nối trong file `.env`
3. Kiểm tra firewall và network settings
4. Xem logs của ứng dụng để biết thêm chi tiết

### Lỗi TypeORM:

1. Đảm bảo entities được import đúng cách
2. Kiểm tra database schema có đúng không
3. Xem TypeORM logs để debug
