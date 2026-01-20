# Список задач

Традиционное веб-приложение для простого управления задачами. Приложение позволяет добавлять, редактировать и удалять задачи.

**Технологии**: PHP, MySQL/MariaDB, Symfony 8, WebPack Encore, Stimulus, Bootstrap 5

<p align="center">
  <img src="./.github/assets/showcase.gif" />
</p>

### Запуск проекта

**Для запуска проекта требуется**:

- PHP >8.3;
- Node.js >16.13.1;
- Composer;
- Symfony CLI;
- MariaDB >10.11 _(NOTE: не проверено с MySQL 8, но работать должен спокойно)_.

1. Установите PHP и JavaScript-зависимости

```bash
composer install
npm install
```

2. Соберите JavaScript-код
```bash
npm run dev # NOTE: npm run build для production-сборки
```

3. Создайте файл .env.local и заполните его данными для подключения к базе данных

```bash
DATABASE_URL="mysql://user:password@localhost:3306/database?serverVersion=10.11.2-MariaDB&charset=utf8mb4"
# DATABASE_URL="mysql://user:password@localhost:3306/database?serverVersion=8.0.32&charset=utf8mb4"
```

4. Создайте базу данных и примените миграции 

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

5. Запустите Symfony сервер

```bash
symfony serve
```
