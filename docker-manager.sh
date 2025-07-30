#!/bin/bash

# Chat Server Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start all services
start_services() {
    print_status "Starting all services..."
    docker-compose up -d
    print_status "Services started successfully!"
    print_status "Access points:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - Kafka: localhost:9092"
    echo "  - Kafka UI: http://localhost:8080"
    echo "  - pgAdmin: http://localhost:5050 (admin@chat.com / admin123)"
    echo "  - Redis Commander: http://localhost:8081"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_status "Services stopped successfully!"
}

# Function to restart all services
restart_services() {
    print_status "Restarting all services..."
    docker-compose restart
    print_status "Services restarted successfully!"
}

# Function to view logs
view_logs() {
    if [ -z "$2" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $2..."
        docker-compose logs -f "$2"
    fi
}

# Function to check service status
check_status() {
    print_status "Service status:"
    docker-compose ps
}

# Function to clean up (remove containers and volumes)
cleanup() {
    print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to build and start the app with services
start_with_app() {
    print_status "Building and starting application with services..."
    docker-compose -f docker-compose.yml -f docker-compose.app.yml up -d --build
    print_status "Application and services started successfully!"
}

# Main script logic
case "$1" in
    start)
        check_docker
        start_services
        ;;
    stop)
        check_docker
        stop_services
        ;;
    restart)
        check_docker
        restart_services
        ;;
    logs)
        check_docker
        view_logs "$@"
        ;;
    status)
        check_docker
        check_status
        ;;
    cleanup)
        check_docker
        cleanup
        ;;
    dev)
        check_docker
        start_with_app
        ;;
    *)
        echo "Chat Server Docker Management"
        echo ""
        echo "Usage: $0 {start|stop|restart|logs|status|cleanup|dev}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all services (PostgreSQL, Redis, Kafka)"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally specify service name)"
        echo "  status   - Check service status"
        echo "  cleanup  - Remove all containers and volumes"
        echo "  dev      - Start services with the application"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs postgres"
        echo "  $0 dev"
        exit 1
esac
