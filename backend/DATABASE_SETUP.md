# Database Setup Guide

## Issue: "Access denied for user 'root'@'localhost'"

This error means the MySQL password in `application.properties` doesn't match your actual MySQL root password.

## Solution Options:

### Option 1: Update application.properties with correct password

1. Open `backend/src/main/resources/application.properties`
2. Find the line: `spring.datasource.password=PROtocol1`
3. Replace `PROtocol1` with your actual MySQL root password
4. Save the file
5. Restart the backend

### Option 2: Reset MySQL root password (if you forgot it)

**Windows:**
1. Stop MySQL service
2. Open Command Prompt as Administrator
3. Navigate to MySQL bin directory (usually `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
4. Run: `mysqld --init-file=C:\\mysql-init.txt`
5. Create `mysql-init.txt` with: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword';`
6. Start MySQL service
7. Update `application.properties` with the new password

**Or use MySQL Workbench:**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword';`
4. Update `application.properties` with the new password

### Option 3: Create a new MySQL user (Recommended for production)

1. Connect to MySQL:
   ```sql
   mysql -u root -p
   ```

2. Create database (if not exists):
   ```sql
   CREATE DATABASE IF NOT EXISTS dbreturnhub;
   ```

3. Create a new user:
   ```sql
   CREATE USER 'returnhub_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON dbreturnhub.* TO 'returnhub_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Update `application.properties`:
   ```
   spring.datasource.username=returnhub_user
   spring.datasource.password=your_secure_password
   ```

## Verify Database Connection

After updating the password, restart the backend. You should see:
```
Tomcat started on port(s): 8080 (http)
```

If you still see database errors, check:
- MySQL service is running
- Database `dbreturnhub` exists
- Username and password are correct

