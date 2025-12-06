# Deploying Golden Equinox to AWS

This guide explains how to deploy the Golden Equinox Planner to AWS Amplify.

## Prerequisites

- An [AWS Account](https://aws.amazon.com/)
- The project code pushed to a Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)

## Option 1: AWS Amplify (Recommended)

AWS Amplify Hosting provides a git-based workflow for hosting fullstack serverless web apps with continuous deployment.

1.  **Log in to the AWS Console** and search for **AWS Amplify**.
2.  Click **Create New App** (or "Host web app").
3.  **Connect functionality**: Choose your repository provider (e.g., GitHub).
4.  **Authorize AWS Amplify** to access your repository.
5.  **Select Repository and Branch**: Choose the `Golden-Equinox-Planner` repo and the `main` branch.
6.  **Configure Build Settings**:
    - Amplify should automatically detect the `amplify.yml` file in the root directory.
    - If not, you can copy-paste the contents of `amplify.yml` into the build settings editor in the console.
    - Ensure `baseDirectory` is set to `/` (root) since this is a static site without a build folder.
7.  **Review and Deploy**: Click **Save and Deploy**.

Amplify will automatically build (skip build in our case) and deploy your app. You will get a global CDN URL (e.g., `https://main.d12345.amplifyapp.com`) and free SSL.

### Configuration Files

-   `amplify.yml`: Defines the build settings for Amplify. Since this is a static site, it simply copies all files from the root `/`.
-   `package.json`: Included to identify the project as a web application, though no npm dependencies are strictly required for the runtime.

## Option 2: S3 Static Website Hosting (Manual)

If you prefer to just upload files:

1.  Create an **S3 Bucket** (e.g., `my-planner-app`).
2.  Enable **Static Website Hosting** in the bucket properties.
3.  Set the **Index document** to `index.html`.
4.  Uncheck "Block all public access" in permissions (Caution: Makes bucket public).
5.  Add a **Bucket Policy** to allow `s3:GetObject` for public read access.
6.  Upload all files from the project folder to the root of the bucket.
