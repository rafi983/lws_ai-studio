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
- [Special Notes](#special-notes)


---

## Live Demo

https://ai-lws-studio.vercel.app/

---

## Features

This application provides a complete workflow for AI image generation and management.

### 🎨 Core Image Generation
- **Prompt-Based Creation:** Describe any image you want using natural language.
- **Enhanced Prompt Input:**
    - **Template Selection:** Pick from curated prompt templates to kickstart your ideas.
    - **AI Prompt Generator:** Let the app suggest creative prompts for you.
    - **Voice Input:** Speak your prompt directly using speech-to-text capabilities.
- **Image Grid Display:** Generates a grid of 9 images from a single prompt, offering multiple options at once.
- **Status-Based Rendering:** Each image shows its current state:
    - *Queued:* Waiting for generation.
    - *Loading:* Animated spinner with a progress bar.
    - *Error:* Displays an error icon and helpful message.
- **Image Modal:** Click an image to view it larger, with metadata (prompt, model, seed, dimensions).

### ✨ Image Modal Thumbnail Navigation

**Feature:**  
- Users can now click on thumbnail previews inside the image modal to instantly view that specific image.

**Why it matters:**  
- This enhances the user experience by allowing quick access to any image in the current generation set without needing to scroll one by one.

**How it works:**  
- A row of mini thumbnails appears beneath the main image in the modal. Clicking any thumbnail immediately displays that image in full preview.


### 🖌️ Canvas Editor Modal

The **Canvas Editor** is a full-featured, in-browser image editor built into the AI image generation app. It allows users to annotate, draw, and enhance generated images directly in the app — no external tools needed.

**Features:**

- **Freehand Drawing**  
  Draw on the image using a customizable brush with color and stroke width controls.

- **Text Annotations**  
  Click anywhere on the canvas to place user-input text with adjustable size and color.

- **Emoji Stickers**  
  Choose from a set of popular emojis to drag-and-drop playful elements onto the image.

- **Undo/Redo History**  
  Every drawing action is recorded and can be reversed or re-applied using undo/redo buttons.

- **Clear Canvas**  
  Revert the canvas back to the original image with a single click.

- **Image Download**  
  Save the edited image as a `.png` file using the built-in download button.

## 💡 How It Works

- When the user clicks the **Edit** button on any generated image, the `CanvasEditorModal` opens.
- The editor loads the image onto a `<canvas>` element at full resolution.
- All drawing and editing actions are rendered directly onto the canvas.
- The final result can be downloaded, but is not yet saved in app state or local history.

### 🔎 Image Comparison Feature

This feature allows users to select two generated images and compare them side-by-side in a responsive modal view. It enhances the user experience by making it easy to visually analyze differences between AI-generated images.

## 💡 How It Works

- ✅ **Selection**: Users select images for comparison using a bold checkmark button (`BsCheckCircleFill` from `react-icons`) on each image card.
- 🔢 **Selection Limit**: Only two images can be selected at a time. Selecting more triggers a toast notification 🔔 informing the user.
- 🔘 **Comparison Button**: Once two images are selected, a floating **Compare Selected (2)** button appears at the bottom-right corner.
- 🖼️ **Comparison Modal**: Clicking the button opens a modal displaying the two images side-by-side with detailed metadata (prompt, model, seed, size).
- ❌ **Close Modal**: Clicking outside the modal or on the close (✖️) button closes the comparison view.
- ⚡ **UI/UX Enhancements**: Utilizes `react-icons` for clear visual feedback and `toastUtils` for real-time notifications.

### ⚙️ Advanced Generation Controls
- **Model Selection:** Choose from dynamically fetched AI models.
- **Seed Control:** Lock a seed for reproducibility or leave blank for randomness.
- **Custom Dimensions:** Set width/height manually or use presets (`1:1`, `16:9`, `4:3`, `3:2`).
- **Watermark Toggle:** Enable/disable the Pollinations logo on images.

### 🖼️ Personalization & History
- **Favourites System:** Mark images as favourites and browse them in a dedicated page.
- **Downloads History:** All downloaded images are tracked and displayed.
- **Prompt History Sidebar:**
    - Auto-saves recent prompts with thumbnails.
    - Click a prompt to reuse.
    - Searchable and clearable.
- **Local Persistence:** All app data (generated images, favourites, downloads, prompt history) is saved in `localStorage`.

---

## Technology Stack

- **React.js:** UI framework
- **Tailwind CSS:** Styling with utility classes
- **React Hooks & Context API:** State management
- **React Icons:** Icon library for UI states
- **React Hot Toast:** User notifications
- **Pollinations AI:** API backend for image generation

---

## Project Setup

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/rafi983/lws_ai-studio.git
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

```text
/src
├── /api         # Centralized API call logic (pollinationsAPI.js)
├── /assets      # Static assets like logos, images
├── /components  # Reusable React components (ImageCard, PromptInput, etc.)
├── /context     # Global state management via Context API
├── /pages       # Main page components (CreateImagePage, FavouritesPage, etc.)
├── App.jsx      # Main application component
<<<<<<< HEAD
└── main.jsx     # Entry point of the application (Vite default)
=======
└── main.jsx     # Entry point of the application (Vite default)

```

## Special Notes

- The **`gptimg` model** requires a special "upgraded" seed to function properly. Acceptable seed values include keywords like `"flower"` or `"nectar"`. Using a regular numeric seed may result in errors or no image generation.
- The application will prompt the user if an invalid seed is used with the `gptimg` model.
- For more details, refer to the [Pollinations API documentation](https://pollinations.ai/).

hola