# Day 3 – CI Pipeline Integration Report

## Intern
**Intern 5 – DevOps & Integration**

## Objective

Update the GitHub Actions CI pipeline to automatically verify the project on every push and pull request.

---

## Tasks Completed

### 1. Created GitHub Actions Workflow

Configured a GitHub Actions workflow (`ci.yml`) to automate Continuous Integration.

Workflow Location:

```
.github/workflows/ci.yml
```

---

### 2. Backend CI

Configured the pipeline to:

- Checkout the repository
- Install Node.js (Version 20)
- Install backend dependencies using:

```bash
npm install
```

Working Directory:

```
Backend_Dtabase
```

---

### 3. Frontend CI

Configured the pipeline to:

- Install frontend dependencies
- Build the React application
- Run lint checks

Commands executed:

```bash
npm install
npm run build
npm run lint
```

Working Directory:

```
Frontend
```

---

## Workflow Trigger

The CI pipeline runs automatically on:

- Push to the `main` branch
- Pull Request to the `main` branch

---

## Technologies Used

- GitHub Actions
- Node.js 20
- npm
- React (Vite)
- Git

---

## Outcome

Successfully configured a Continuous Integration pipeline that automatically:

- Installs backend dependencies
- Installs frontend dependencies
- Builds the frontend application
- Performs frontend linting

This ensures that code quality is checked automatically for every push and pull request.

---

## Conclusion

The Day 3 DevOps objective was successfully completed by implementing an automated CI pipeline using GitHub Actions. This provides an automated validation process before integrating future project changes.