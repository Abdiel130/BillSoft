## [Unreleased]

## [0.5.0] - 2026-03-13

### Added
- Created `ModalComponent` and `RadioButtonComponent` as generic UI components.
- Implemented `SATService` on the frontend for interaction with SAT scraping features.
- Added `SatSelectors`, `SatController`, `SatRoute`, and `SatScraperService` on the backend for automated SAT portal interaction.
- Created `SatErrors` for specific captcha and session handling.
- Added `repository.controller.js` to the server.

### Changed
- Refactored `RouterService` to support traditional Express routers and `apiResource` simultaneously.
- Standardized all server responses using `ResponseService`.
- Moved `MenuService` to the `components/menu` directory and updated all internal references.
- Updated session expiration configuration to use seconds (defaulting to 5 minutes) in `example.env`.
- Translated variable and function names from Spanish to English across the codebase while maintaining Spanish logs/messages.
- Enhanced `MenuItemComponent` and `RadioButtonComponent` UI with consistent system theme colors and animations.
- Fixed synthetic animation properties in the generic Modal component.

## [0.4.2] - 2026-03-13

### Changed
- Updated `menu-item` component to use the system's primary color theme for selected items.
- Implemented a professional sliding background animation ("pill drop") for the active menu item.
- Added smooth transitions and hover effects to sidebar navigation elements for a premium feel.

## [0.4.1] - 2026-03-13

### Added
- Created `server/errors` directory to centralize custom exception classes.
- Added `puppeteer` and `uuid` dependencies to the server.

### Changed
- Moved `drizzle.config.js` to `server/config/` and updated database scripts in `package.json`.
- Relocated `exceptions.js` from `server/utils/` to `server/errors/`.
- Updated all relative imports of `ValidationException` and `UnauthorizedException` across the server.

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