# Deployment Guide for miniStore

## 1. Firebase Setup
Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.

### Authentication
- Enable **Email/Password** and **Google** sign-in providers in the Authentication section.

### Firestore Database
- Create a Database.
- Start in test mode (or use the rules provided in `FIREBASE_RULES.md`).
- Collections will be automatically created on first use: `stores`, `products`.

### Storage
- Enable Firebase Storage.
- Set rules to allow read/write access for authenticated users.

### Configuration
- Copy your Firebase SDK Configuration (from Project Settings).
- Paste it into `src/firebase/config.js` on your local machine.

## 2. Local Development
```bash
npm install
npm run dev
```

## 3. Deployment to GitHub Pages
1. Install the `gh-pages` package:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Update `package.json`:
   - Add `"homepage": "https://username.github.io/repo-name"`
   - Add scripts:
     ```json
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
     ```
3. Run deployment:
   ```bash
   npm run deploy
   ```

## 4. Environment Variables (Recommended)
For production, create a `.env` file and use `import.meta.env.VITE_FIREBASE_API_KEY` style variables instead of hard-coding them in `config.js`.
