## [Unreleased]

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