#!/usr/bin/env node

/**
 * Digital Tracking Merchandising - Backup Script
 * Handles automated backups of databases, files, and configurations
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const archiver = require('archiver');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const execAsync = promisify(exec);

class BackupManager {
  constructor(config) {
    this.config = {
      backupDir: process.env.BACKUP_DIR || './backups',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
      databaseUrl: process.env.DATABASE_URL,
      s3Bucket: process.env.S3_BACKUP_BUCKET,
      emailConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      },
      ...config
    };

    this.s3 = new AWS.S3();
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Create database backup
   */
  async createDatabaseBackup() {
    try {
      console.log('Creating database backup...');
      
      const backupPath = path.join(this.config.backupDir, `db-backup-${this.timestamp}.sql`);
      
      // Parse database URL
      const dbUrl = new URL(this.config.databaseUrl);
      const dbName = dbUrl.pathname.slice(1);
      const dbHost = dbUrl.hostname;
      const dbPort = dbUrl.port || 5432;
      const dbUser = dbUrl.username;
      const dbPassword = dbUrl.password;

      // Create backup command
      const backupCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f ${backupPath}`;
      
      await execAsync(backupCommand);
      
      console.log(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Create file system backup
   */
  async createFileBackup() {
    try {
      console.log('Creating file system backup...');
      
      const backupPath = path.join(this.config.backupDir, `files-backup-${this.timestamp}.zip`);
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          console.log(`File backup created: ${backupPath}`);
          resolve(backupPath);
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        // Add important directories to backup
        const dirsToBackup = [
          './src',
          './backend',
          './WorkforceMobileExpo',
          './config',
          './docs'
        ];

        dirsToBackup.forEach(dir => {
          if (fs.existsSync(dir)) {
            archive.directory(dir, dir);
          }
        });

        // Add important files
        const filesToBackup = [
          './package.json',
          './docker-compose.yml',
          './docker-compose.dev.yml',
          './README.md'
        ];

        filesToBackup.forEach(file => {
          if (fs.existsSync(file)) {
            archive.file(file, { name: file });
          }
        });

        archive.finalize();
      });
    } catch (error) {
      console.error('File backup failed:', error);
      throw error;
    }
  }

  /**
   * Create configuration backup
   */
  async createConfigBackup() {
    try {
      console.log('Creating configuration backup...');
      
      const backupPath = path.join(this.config.backupDir, `config-backup-${this.timestamp}.json`);
      
      const configData = {
        timestamp: this.timestamp,
        environment: process.env.NODE_ENV,
        database: {
          host: new URL(this.config.databaseUrl).hostname,
          database: new URL(this.config.databaseUrl).pathname.slice(1)
        },
        services: {
          redis: process.env.REDIS_URL,
          apiGateway: process.env.API_GATEWAY_URL
        },
        docker: {
          version: await this.getDockerVersion(),
          containers: await this.getRunningContainers()
        }
      };

      await fs.writeJson(backupPath, configData, { spaces: 2 });
      
      console.log(`Configuration backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Configuration backup failed:', error);
      throw error;
    }
  }

  /**
   * Upload backup to S3
   */
  async uploadToS3(filePath) {
    if (!this.config.s3Bucket) {
      console.log('S3 bucket not configured, skipping upload');
      return;
    }

    try {
      console.log(`Uploading ${filePath} to S3...`);
      
      const fileName = path.basename(filePath);
      const fileContent = await fs.readFile(filePath);
      
      const uploadParams = {
        Bucket: this.config.s3Bucket,
        Key: `backups/${fileName}`,
        Body: fileContent,
        ContentType: this.getContentType(filePath),
        Metadata: {
          'backup-timestamp': this.timestamp,
          'backup-type': this.getBackupType(filePath)
        }
      };

      const result = await this.s3.upload(uploadParams).promise();
      console.log(`Uploaded to S3: ${result.Location}`);
      
      return result.Location;
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw error;
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups() {
    try {
      console.log('Cleaning up old backups...');
      
      const files = await fs.readdir(this.config.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      for (const file of files) {
        const filePath = path.join(this.config.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          console.log(`Removed old backup: ${file}`);
        }
      }

      console.log('Cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Send backup notification
   */
  async sendNotification(success, details) {
    if (!this.config.emailConfig.host) {
      console.log('Email not configured, skipping notification');
      return;
    }

    try {
      const transporter = nodemailer.createTransporter(this.config.emailConfig);
      
      const subject = success ? 
        '✅ Backup Completed Successfully' : 
        '❌ Backup Failed';
      
      const html = `
        <h2>Digital Tracking Merchandising - Backup Report</h2>
        <p><strong>Status:</strong> ${success ? 'Success' : 'Failed'}</p>
        <p><strong>Timestamp:</strong> ${this.timestamp}</p>
        <p><strong>Details:</strong></p>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      `;

      await transporter.sendMail({
        from: this.config.emailConfig.auth.user,
        to: process.env.BACKUP_NOTIFICATION_EMAIL,
        subject,
        html
      });

      console.log('Notification sent');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Run complete backup process
   */
  async runBackup() {
    const startTime = Date.now();
    const results = {
      success: true,
      errors: [],
      files: [],
      s3Uploads: []
    };

    try {
      // Ensure backup directory exists
      await fs.ensureDir(this.config.backupDir);

      // Create backups
      const dbBackup = await this.createDatabaseBackup();
      results.files.push(dbBackup);

      const fileBackup = await this.createFileBackup();
      results.files.push(fileBackup);

      const configBackup = await this.createConfigBackup();
      results.files.push(configBackup);

      // Upload to S3
      for (const file of results.files) {
        try {
          const s3Location = await this.uploadToS3(file);
          results.s3Uploads.push(s3Location);
        } catch (error) {
          results.errors.push(`S3 upload failed for ${file}: ${error.message}`);
        }
      }

      // Cleanup old backups
      await this.cleanupOldBackups();

      const duration = Date.now() - startTime;
      results.duration = duration;
      results.timestamp = this.timestamp;

      console.log(`Backup completed successfully in ${duration}ms`);
      
      await this.sendNotification(true, results);
      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      results.duration = Date.now() - startTime;
      results.timestamp = this.timestamp;

      console.error('Backup failed:', error);
      
      await this.sendNotification(false, results);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  async getDockerVersion() {
    try {
      const { stdout } = await execAsync('docker --version');
      return stdout.trim();
    } catch {
      return 'Not available';
    }
  }

  async getRunningContainers() {
    try {
      const { stdout } = await execAsync('docker ps --format "{{.Names}}"');
      return stdout.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.sql': 'application/sql',
      '.zip': 'application/zip',
      '.json': 'application/json'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  getBackupType(filePath) {
    if (filePath.includes('db-backup')) return 'database';
    if (filePath.includes('files-backup')) return 'files';
    if (filePath.includes('config-backup')) return 'configuration';
    return 'unknown';
  }

  /**
   * Schedule automated backups
   */
  scheduleBackups(cronExpression = '0 2 * * *') { // Daily at 2 AM
    console.log(`Scheduling backups with cron: ${cronExpression}`);
    
    cron.schedule(cronExpression, async () => {
      console.log('Running scheduled backup...');
      try {
        await this.runBackup();
      } catch (error) {
        console.error('Scheduled backup failed:', error);
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const backupManager = new BackupManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'run':
      backupManager.runBackup()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'schedule':
      backupManager.scheduleBackups();
      console.log('Backup scheduler started. Press Ctrl+C to stop.');
      break;
      
    case 'cleanup':
      backupManager.cleanupOldBackups()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log(`
Usage: node backup.js <command>

Commands:
  run      - Run a single backup
  schedule - Start the backup scheduler
  cleanup  - Clean up old backups

Environment variables:
  BACKUP_DIR - Directory to store backups
  BACKUP_RETENTION_DAYS - Days to keep backups
  DATABASE_URL - Database connection string
  S3_BACKUP_BUCKET - S3 bucket for backup storage
  SMTP_* - Email configuration for notifications
      `);
      process.exit(1);
  }
}

module.exports = BackupManager; 