# Database Migrations (Alembic)

Generate a new migration after changing models:

```bash
alembic revision --autogenerate -m "describe your change"
```

Apply migrations:

```bash
alembic upgrade head
```

Roll back the last migration:

```bash
alembic downgrade -1
```

The database URL is read from application settings (`app.config.settings.DATABASE_URL`),
so make sure your `.env` is configured before running migrations.
