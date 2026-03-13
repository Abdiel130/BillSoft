## [Unreleased]

## [0.4.0] - 2026-03-12

### Added
- Created `authMiddleware` for secure session management.
- Implemented `PortalLayout` and `Sidebar` for main application structure.
- Created base components for `Clients`, `Dashboard`, `Invoices`, `Reports`, `Settings`, and `Users`.
- Integrated `Lucide` icons and `Tailwind CSS` into the Angular project.
- Created `proxy.conf.json` for API request proxying and `test_db.js` for DB testing.

### Changed
- Updated `docker-compose.yml` with named volumes and debug port configuration.
- Integrated `cors` middleware in `server/index.js` for API access.
- Updated `app.config.ts` with global interceptors and icon providers.
- Refactored project build configuration (`angular.json`, `package.json`, `tailwind.config.js`, `postcss.config.js`).

## [0.3.0] - 2026-03-12

### Added
- Implemented `AuthService` with JWT generation and bcrypt password hashing.
- Created `AuthController` for authentication and user profile management.
- Implemented `seed-user.js` script to generate development users.
- Created frontend `AuthService` for JWT storage and session handling.
- Implemented `AuthGuard` to protect private portal routes.
- Created `AuthInterceptor` to automatically inject JWT in HTTP headers.
- Integrated login components with backend API for full authentication flow.

### Changed
- Refactored `server/routes/web.js` to separate public and authenticated routes.
- Updated `app.routes.ts` to include route protection via guards.

## [0.2.0] - 2026-03-07

### Added
- Created diagram of the database schema.
- Created `server/db/migrate.js` script to manually execute Drizzle migrations against MySQL.
- Added `db:migrate` script to `package.json`.

### Changed
- Migrated database schema and Drizzle ORM configuration from PostgreSQL to MySQL.
- Switched database driver dependencies: replaced `pg` with `mysql2` and `drizzle-orm/mysql2`.
- Updated `server/db/schema.js` to utilize MySQL-specific syntax (`mysqlTable`, `int`, `mysqlEnum`, `autoincrement()`).
- Upgraded the database connection pool in `server/db/index.js` with stability configurations (`connectionLimit`, `enableKeepAlive`, etc.).
- Adjusted `drizzle.config.js` to explicitly state `dialect: "mysql"` and properly pass `url` credentials.
- Updated `package.json` drizzle scripts to accurately rely on the `--config=./db/drizzle.config.js` flag and removed hardcoded driver suffixes.

### Fixed
- Fixed typo in `server/db/schema.js` replacing undefined export `usuario` with `user`.

## [0.1.1] - 2026-03-06

### Added
- Created `Validator` utility for schema-based request validation leveraging factory functions (SOLID principles).
- Implemented comprehensive validation rules: `required`, `string`, `email`, `default`, `numeric`, `boolean`, `regex`, `array`, `inList`, `date`, `match`, `uuid`, and `object`.
- Updated `ValidationException` to support detailed, field-level error messages via an `errors` object.

## [0.1.0] - 2026-03-05

### Added
- RouterService for grouped routes and CRUD controllers (`apiResource`)
- Global exception handling with custom error classes
- Winston logger integration for local file error tracking
- API service for standardized JSON responses
- Refactored controllers using arrow functions for IDE autocomplete
- Base auth routes (login/profile) with placeholder middleware
- Added `winston` and `winston-daily-rotate-file` dependencies

## [0.0.1] - 2026-03-05

### Added
- Button component
- Input component
- Frontend login page completed (login.component.html, login.component.ts, login.component.css)
- Changelog file