# LWS AI - AI Image Generation Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A feature-rich, single-page web application that provides a user-friendly studio for generating images using the Pollinations AI service. This project allows users to create, manage, and save their AI-generated artwork in a clean, modern interface.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Setup](#project-setup)
- [Available Scripts](#available-scripts)
- [File Structure](#file-structure)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Live Demo

[Link to your deployed application would go here - e.g., https://your-app-name.netlify.app/](https://your-app-name.netlify.app/)

---

## Features

This application provides a complete workflow for AI image generation and management.

### 🎨 Core Image Generation
* **Prompt-Based Creation:** A central input field allows users to describe any image they want to create using natural language.
* **Image Grid Display:** Generates a grid of 9 images from a single prompt, offering multiple options at once.
* **Loading & Error States:** The interface provides clear feedback, showing loading skeletons while images are generating and a placeholder card if an image fails to load.

### ⚙️ Advanced Generation Controls
* **Model Selection:** Users can choose from a dropdown list of different AI models to experiment with various artistic styles.
* **Seed Control:** A "Seed" input field allows for reproducible results. If a seed is provided, it will generate 9 identical images. If left empty, it will generate 9 random images.
* **Custom Dimensions:** Users can set the precise width and height for the output images.
* **Aspect Ratio Presets:** For convenience, users can click presets like `1:1`, `16:9`, `4:3`, and `3:2` to automatically set the dimensions.
* **Watermark Toggle:** A switch allows the user to remove the default logo/watermark from the generated images.

### 🖼️ Personalization & History
* **Image Modal:** Any generated image can be clicked to open a detailed modal view, which displays the full image along with its metadata (prompt, model, seed, and dimensions).
* **Direct Download:** Each image card has a button to download the final `.png` file.
* **Favourites System:** Users can mark any image as a "favourite." A dedicated "Favourites" page displays all saved images, creating a personal gallery.
* **Downloads History:** The app keeps a record of every downloaded image, which can be viewed on the "Downloads" page.
* **Prompt History:** The application automatically saves recent prompts. This history is searchable and allows users to instantly reuse a previous prompt.
* **Local Persistence:** All user data (Favourites, Downloads, Prompt History) is saved in the browser's `localStorage`, so their collections and settings persist between sessions.

---

## Technology Stack

This project is built exclusively with frontend technologies and relies on the Pollinations AI service for image generation.

* **React.js:** A JavaScript library for building user interfaces.
* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
* **React Hooks & Context API:** For state management and side effects without external libraries.
* **React Hot Toast:** For displaying notifications to the user.
* **Pollinations AI:** Used as the backend service for generating images.

---

## Project Setup

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/rafi983/lws_ai-studio.git](https://github.com/rafi983/lws_ai-studio.git)
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd lws_ai-studio 
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

---

## Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode. Open [http://localhost:5173](http://localhost:5173) to view it in your browser. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `dist` folder (Vite default). It correctly bundles React in production mode and optimizes the build for the best performance.

---

## File Structure

The project follows a standard React application structure, organized for scalability and maintainability.

/src
├── /api         # Centralized API call logic (pollinationsAPI.js)
├── /assets      # Static assets like logos, images
├── /components  # Reusable React components (ImageCard, PromptInput, etc.)
├── /context     # Global state management via Context API
├── /pages       # Main page components (CreateImagePage, FavouritesPage, etc.)
├── App.jsx      # Main application component
└── main.jsx     # Entry point of the application (Vite default)

---