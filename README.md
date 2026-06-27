# Developer Performance Dashboard

A personal Developer Performance Dashboard built with Next.js (App Router), Prisma (SQLite), Tailwind, and Recharts.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the project with the following:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # Authentication
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_PASSWORD="your-secure-password"

   # Bitbucket Sync
   BITBUCKET_WORKSPACE="your-bitbucket-workspace-id"
   BITBUCKET_REPO_SLUG="your-repo-name"
   BITBUCKET_USERNAME="your-bitbucket-username"
   BITBUCKET_APP_PASSWORD="your-app-password"
   ```

3. **Bitbucket App Password Setup**
   To fetch commits, you need a Bitbucket App Password:
   - Go to your Bitbucket account settings (Personal Settings).
   - Click on **App passwords** under Access Management.
   - Click **Create app password**.
   - Give it a label (e.g., "Dev Performance Dashboard").
   - Under Permissions, check **Repositories: Read**.
   - Click **Create** and copy the generated password.
   - Paste it into your `.env` as `BITBUCKET_APP_PASSWORD`.

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the App**
   ```bash
   npm run dev
   ```

## Webhooks
To automate commit syncing, set up a webhook in your Bitbucket repository:
- URL: `https://your-domain.com/api/bitbucket/webhook`
- Triggers: `Repository push`
