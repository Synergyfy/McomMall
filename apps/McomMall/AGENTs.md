# 🤖 AI Agent Guidelines for the McomMall Project

Welcome! You are an AI assistant helping with our NestJS project. To ensure your contributions are clean, maintainable, and align with our architecture, please follow these guidelines for every task.

## 1. Core Architecture: Modules & DI

This is the most critical part of our NestJS architecture. Errors here are common and hard to fix.

* **Module Encapsulation:** Every new feature (e.g., "Payments," "Notifications") **must** be created in its own dedicated NestJS module (e.g., `PaymentsModule`, `NotificationsModule`).
    * All new Controllers, Services, and Providers must be declared in the `providers` or `controllers` array of their feature module.
    * The feature module must then be imported into the module that needs it (e.g., `AppModule`).
* **No Circular Dependencies:** Your primary goal is to avoid circular dependencies between services or modules.
    * **Rule:** Service A **must not** import Service B if Service B already imports Service A.
    * **Last Resort:** If a circular dependency is *absolutely* unavoidable, you must use `forwardRef()` from `@nestjs/common` to resolve it. Use this sparingly.
* **Avoid `@Global()`:** Do not make new modules global (`@Global()`) unless explicitly instructed. It's better to import feature modules directly where they are needed.

### Dependency Injection (DI) Practices

* **Constructor Injection:** **Always** use constructor-based dependency injection to inject providers (like services) into classes (like controllers or other services). This is the standard in NestJS and makes dependencies explicit.
    * **Good:** `constructor(private readonly usersService: UsersService) {}`
    * **Bad:** Avoid using `@Inject()` manually unless you are injecting a non-class-based provider (e.g., a string token, factory, or value).
* **Provider Scope:** Use the default `SINGLETON` scope for all providers. Do not change to `REQUEST` or `TRANSIENT` scope unless it is a specific requirement of the task.

## 2. File Imports & Paths

* **Use Path Aliases:** This project is configured with TypeScript path aliases (e.g., `@/users`, `@/common`).
    * **Rule:** **Always** use path aliases for imports *outside* of your current module's directory.
        * Example: `import { UsersService } from '@/users/users.service';`
    * **Rule:** Use relative paths (`./` or `../`) **only** for imports *within* the same feature-module directory.
        * Example: `import { User } from './entities/user.entity';` (when inside the `users` directory).
    * **Reason:** This prevents fragile, deep relative paths (`../../../../services/foo`) and makes code much easier to refactor.
* **Avoid Barrel Files (`index.ts`):** Do not use `index.ts` files to group-export and re-export modules, services, or providers. This practice can confuse the NestJS dependency injection graph and accidentally create circular references.

## 3. Dependency Management

* **Specify Package Manager:** This project uses **npm**. All new dependencies must be added using `npm install <package-name>` or `npm install --save-dev <package-name>`.
* **One Change at a Time:** If a task requires both installing new packages and writing code, prefer to do it in two steps. First, add the packages. Second, implement the logic.
* **Check for Conflicts:** Before adding a new package, check `package.json` to see if a conflicting package (e.g., a different version) already exists.

## 4. Code & Patterns

* **Environment Variables:** All secret keys, API URLs, and database credentials **must** be loaded from environment variables using `@nestjs/config`.
    * Access them via `ConfigService`.
    * **Do not** hard-code any secrets in the source code.
* **DTOs & Validation:** All incoming data (especially request bodies in controllers) **must** be validated using Data Transfer Objects (DTOs) with `class-validator` and `class-transformer` decorators (`@IsString()`, `@IsEmail()`, etc.).
* **Error Handling:** Use NestJS's built-in HTTP exception classes (`@nestjs/common`) like `NotFoundException`, `BadRequestException`, or `UnauthorizedException`.

## 5. Testing

* **Pass Existing Tests:** All changes you make **must** pass the project's existing test suite (`npm test`).
* **Write New Tests:** If you add a new public method to a service or a new controller endpoint, you must also add corresponding unit or e2e tests.