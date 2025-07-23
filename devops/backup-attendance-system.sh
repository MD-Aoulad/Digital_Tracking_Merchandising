#!/bin/bash

# Enhanced Attendance System Backup Script
# This script creates comprehensive backups of the attendance system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./database/backups"
COMPOSE_FILE="attendance-service-deployment.yml"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="attendance_backup_$DATE"

# Function to print status
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    print_status "Creating backup directory..."
    mkdir -p "$BACKUP_DIR"
    print_status "Backup directory ready: $BACKUP_DIR"
}

# Backup PostgreSQL database
backup_database() {
    print_status "Creating database backup..."
    
    local db_backup_file="$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    
    # Check if database container is running
    if ! docker-compose -f "$COMPOSE_FILE" ps attendance-db | grep -q "Up"; then
        print_error "Database container is not running. Cannot create backup."
        return 1
    fi
    
    # Create database backup
    docker-compose -f "$COMPOSE_FILE" exec -T attendance-db pg_dump \
        -U attendance_user \
        -d attendance_db \
        --clean \
        --if-exists \
        --create \
        --verbose \
        > "$db_backup_file"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Database backup created: $db_backup_file"
        
        # Compress the backup
        gzip "$db_backup_file"
        print_status "✅ Database backup compressed: ${db_backup_file}.gz"
        
        # Get file size
        local size=$(du -h "${db_backup_file}.gz" | cut -f1)
        print_status "Backup size: $size"
    else
        print_error "❌ Database backup failed"
        return 1
    fi
}

# Backup Redis data
backup_redis() {
    print_status "Creating Redis backup..."
    
    local redis_backup_file="$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"
    
    # Check if Redis container is running
    if ! docker-compose -f "$COMPOSE_FILE" ps attendance-redis | grep -q "Up"; then
        print_warning "Redis container is not running. Skipping Redis backup."
        return 0
    fi
    
    # Copy Redis dump file
    docker cp attendance-redis:/data/dump.rdb "$redis_backup_file" 2>/dev/null || {
        print_warning "No Redis dump file found. Skipping Redis backup."
        return 0
    }
    
    if [ -f "$redis_backup_file" ]; then
        print_status "✅ Redis backup created: $redis_backup_file"
        
        # Compress the backup
        gzip "$redis_backup_file"
        print_status "✅ Redis backup compressed: ${redis_backup_file}.gz"
        
        # Get file size
        local size=$(du -h "${redis_backup_file}.gz" | cut -f1)
        print_status "Redis backup size: $size"
    else
        print_warning "No Redis data to backup"
    fi
}

# Backup uploaded files
backup_uploads() {
    print_status "Creating uploads backup..."
    
    local uploads_backup_file="$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz"
    
    # Check if attendance service container is running
    if ! docker-compose -f "$COMPOSE_FILE" ps attendance-service | grep -q "Up"; then
        print_warning "Attendance service container is not running. Skipping uploads backup."
        return 0
    fi
    
    # Create tar archive of uploads
    docker-compose -f "$COMPOSE_FILE" exec -T attendance-service tar -czf - /uploads/attendance > "$uploads_backup_file" 2>/dev/null || {
        print_warning "No uploads directory found or empty. Skipping uploads backup."
        return 0
    }
    
    if [ -f "$uploads_backup_file" ] && [ -s "$uploads_backup_file" ]; then
        print_status "✅ Uploads backup created: $uploads_backup_file"
        
        # Get file size
        local size=$(du -h "$uploads_backup_file" | cut -f1)
        print_status "Uploads backup size: $size"
    else
        print_warning "No uploads to backup"
        rm -f "$uploads_backup_file"
    fi
}

# Backup configuration files
backup_config() {
    print_status "Creating configuration backup..."
    
    local config_backup_file="$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz"
    
    # Create tar archive of configuration files
    tar -czf "$config_backup_file" \
        --exclude='node_modules' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='database/backups' \
        . 2>/dev/null || {
        print_error "Configuration backup failed"
        return 1
    }
    
    print_status "✅ Configuration backup created: $config_backup_file"
    
    # Get file size
    local size=$(du -h "$config_backup_file" | cut -f1)
    print_status "Configuration backup size: $size"
}

# Create backup manifest
create_manifest() {
    print_status "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/${BACKUP_NAME}_manifest.txt"
    
    cat > "$manifest_file" << EOF
Enhanced Attendance System Backup Manifest
==========================================
Backup Date: $(date)
Backup Name: $BACKUP_NAME
System Version: 1.0.0

Files Included:
EOF
    
    # List all backup files
    for file in "$BACKUP_DIR"/"$BACKUP_NAME"*; do
        if [ -f "$file" ]; then
            local size=$(du -h "$file" | cut -f1)
            echo "- $(basename "$file") ($size)" >> "$manifest_file"
        fi
    done
    
    cat >> "$manifest_file" << EOF

Backup Information:
- Database: PostgreSQL attendance_db
- Cache: Redis
- Files: Uploaded attendance photos
- Configuration: All system configuration files

Restore Instructions:
1. Stop the attendance system: ./deploy-attendance-system.sh stop
2. Restore database: docker-compose exec attendance-db psql -U attendance_user -d attendance_db < ${BACKUP_NAME}_database.sql.gz
3. Restore uploads: docker-compose exec attendance-service tar -xzf - < ${BACKUP_NAME}_uploads.tar.gz
4. Restore config: tar -xzf ${BACKUP_NAME}_config.tar.gz
5. Start the system: ./deploy-attendance-system.sh

EOF
    
    print_status "✅ Backup manifest created: $manifest_file"
}

# Clean old backups
cleanup_old_backups() {
    print_status "Cleaning old backups (keeping last 10)..."
    
    # Keep only the last 10 backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt 10 ]; then
        local files_to_remove=$(ls -t "$BACKUP_DIR"/*.gz | tail -n +11)
        
        for file in $files_to_remove; do
            print_status "Removing old backup: $(basename "$file")"
            rm -f "$file"
        done
        
        print_status "Old backups cleaned up"
    else
        print_status "No old backups to clean up"
    fi
}

# Display backup summary
display_backup_summary() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}Backup Summary${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${GREEN}Backup Name:${NC} $BACKUP_NAME"
    echo -e "${GREEN}Backup Date:${NC} $(date)"
    echo -e "${GREEN}Backup Location:${NC} $BACKUP_DIR"
    echo ""
    echo -e "${YELLOW}Backup Files:${NC}"
    
    local total_size=0
    for file in "$BACKUP_DIR"/"$BACKUP_NAME"*; do
        if [ -f "$file" ]; then
            local size=$(du -h "$file" | cut -f1)
            echo -e "  - $(basename "$file") ($size)"
            total_size=$(du -c "$BACKUP_DIR"/"$BACKUP_NAME"* | tail -1 | cut -f1)
        fi
    done
    
    echo ""
    echo -e "${GREEN}Total Backup Size:${NC} $(echo $total_size | sed 's/[0-9]*//')"
    echo -e "${BLUE}==========================================${NC}"
}

# Main backup process
main() {
    print_status "Starting Enhanced Attendance System backup..."
    
    # Create backup directory
    create_backup_dir
    
    # Create backups
    backup_database
    backup_redis
    backup_uploads
    backup_config
    
    # Create manifest
    create_manifest
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Display summary
    display_backup_summary
    
    print_status "Enhanced Attendance System backup completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    "list")
        print_status "Listing available backups..."
        if [ -d "$BACKUP_DIR" ]; then
            ls -la "$BACKUP_DIR"/*.gz 2>/dev/null || print_warning "No backups found"
        else
            print_warning "Backup directory does not exist"
        fi
        ;;
    "restore")
        if [ -z "$2" ]; then
            print_error "Please specify backup name to restore"
            echo "Usage: $0 restore <backup_name>"
            exit 1
        fi
        print_status "Restore functionality not implemented yet"
        print_warning "Please restore manually using the instructions in the manifest file"
        ;;
    *)
        main
        ;;
esac 