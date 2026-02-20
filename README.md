# DatasetForge AI

Universal AI Dataset Generator built with Next.js, Genkit, and Gemini.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up environment variables**:
    Ensure your `GOOGLE_GENAI_API_KEY` is configured in your environment.
3.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Pushing to a Remote Repository

To push your code to GitHub, GitLab, or Bitbucket, follow these steps:

1.  **Initialize Git** (if you haven't already):
    ```bash
    git init
    ```
2.  **Add your files**:
    ```bash
    git add .
    ```
3.  **Commit your changes**:
    ```bash
    git commit -m "Initial commit: DatasetForge AI"
    ```
4.  **Add your remote repository URL**:
    ```bash
    git remote add origin <your-repository-url>
    ```
5.  **Push to the remote**:
    ```bash
    git push -u origin main
    ```

## Deployment

This project is configured for **Firebase App Hosting**. To deploy, connect your GitHub repository to a Firebase Project through the Firebase Console. The `apphosting.yaml` file is already set up for you.