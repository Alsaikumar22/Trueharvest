
# True Harvest - Development Workflow

This project follows a strict branching strategy to ensure the stability of the Live application while allowing for rapid development of new features.

## 🌳 Branching Strategy

### 1. `main` (Production / Live)
- **Do not push directly to this branch.**
- This branch contains the code currently deployed to the live website (trueharvest.world).
- Only merge into `main` when a feature is 100% tested and ready.

### 2. `dev` (Development / Staging)
- **All new development happens here.**
- When you are working on the app, ensure you are on this branch:
  ```bash
  git checkout dev
  ```
- Pushing to this branch creates a "Preview Deployment" (if using Vercel/Netlify) that you can share for testing.

## 🚀 How to Develop Safely

1. **Start coding:**
   Ensure you are on the dev branch.
   ```bash
   git checkout dev
   npm run dev
   ```
   *You will see a "DEV MODE" badge in the app header.*

2. **Save your changes:**
   ```bash
   git add .
   git commit -m "Added new feature: ..."
   git push origin dev
   ```

3. **Go Live:**
   When you are ready to update the real website:
   ```bash
   git checkout main
   git merge dev
   git push origin main
   git checkout dev  # Always go back to dev immediately!
   ```

## 🛠 Setup New Repository

If moving this code to a new GitHub repository:

```bash
# 1. Point to new repo
git remote set-url origin https://github.com/YourUsername/new-repo.git

# 2. Push Live State
git push -u origin main

# 3. Create and Push Dev State
git checkout -b dev
git push -u origin dev
```
