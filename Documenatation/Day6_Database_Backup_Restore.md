# Day 6 – Database Backup & Restore

## Objective
Create a backup of the PostgreSQL database and verify that it can be restored successfully.

## Database
- Database Name: marketmind
- Database: PostgreSQL 16

## Backup Steps

1. Created a backup folder:
```
mkdir -p Database_Backups
```

2. Created the database backup:
```
pg_dump -U postgres -d marketmind > Database_Backups/marketmind_backup.sql
```

3. Verified the backup file:
```
ls -lh Database_Backups
```

## Restore Steps

1. Created a test database:
```
createdb -U postgres marketmind_test
```

2. Restored the backup:
```
psql -U postgres -d marketmind_test < Database_Backups/marketmind_backup.sql
```

3. Verified the restored tables:
```
\dt
```

The following tables were restored successfully:

- categories
- customers
- inventory
- invoices
- payments
- products
- roles
- sales_items
- sales_transactions
- users

## Backup Automation

Created a backup script:

```
scripts/backup.sh
```

Run the script using:

```
./scripts/backup.sh
```

## Result

- Database backup created successfully.
- Backup restored successfully.
- Restored database verified.
- Backup automation script tested successfully.