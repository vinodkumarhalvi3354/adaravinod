# AdaraVinod

AdaraVinod is a AI-driven web application that offers real-time audio transcription and translation. It utilizes state-of-the-art models like OpenAI's Whisper for speech recognition and Xenova's NLLB-200 for translations, providing accurate and timestamped text outputs. 


## Technologies Used

- **React**: For building the front-end user interface.
- **Tailwind CSS**: For responsive and modern styling.
- **Vite**: For fast bundling and development experience.
- **OpenAI Whisper**: For automatic speech recognition (ASR) in English.
- **Xenova NLLB-200**: For accurate and scalable translations between languages.
- **Web Workers**: For running AI models and transcription tasks in the background without blocking the UI.

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vinodkumarhalvi3354/adaravinod.git
   cd adaravinod
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build for Production

```bash
npm run build
```
This will create a dist directory containing the build files.

### Deploy to Firebase Hosting

Initialize Firebase Hosting

Run the following command to initialize Firebase Hosting in your project:

```bash
firebase init hosting
```

Follow the prompts:
•	Select your Firebase project or create a new one.
•	Set the public directory to dist.
•	Choose Yes to configure the app as a single-page application (rewrite all URLs to /index.html).
•	Skip automatic GitHub deployments for now (optional).
b. Deploy the Application

Deploy your app to Firebase Hosting:

```bash
firebase deploy
```

Firebase will provide a unique URL for your hosted app (e.g., https://your-project-id.web.app).



