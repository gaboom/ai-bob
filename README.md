# AI-Bob: Real-Time AI Voice Conversation

This project is a web application that demonstrates a real-time, bidirectional voice conversation with OpenAI's models using their Realtime API and WebRTC. It is built with plain HTML, CSS, and JavaScript, and uses a minimal Node.js backend for secure credential vending.

## Features

- **Real-Time, Bidirectional Audio:** Engages in a low-latency voice conversation directly in the browser.
- **Frontend-Driven Logic:** All real-time communication is handled directly on the client-side using native WebRTC APIs, bypassing the need for a complex backend orchestrator.
- **Text Messaging:** In addition to voice, you can send text messages to the AI.
- **Structured Event Log:** A clear, interactive log displays all events from the OpenAI Realtime API, with a detailed JSON viewer for inspecting message payloads.
- **Secure Credential Vending:** A minimal Node.js/Express backend securely exchanges the permanent OpenAI API key for a short-lived ephemeral key, which is then used by the frontend. This follows security best practices by never exposing the main API key in the browser.

## How to Run

1.  **Prerequisites:**
    *   Node.js and npm installed.
    *   An OpenAI API key.

2.  **Installation:**
    *   Clone the repository.
    *   Create a `.env` file in the root of the project and add your OpenAI API key:
        ```
        OPENAI_API_KEY=your_api_key_here
        ```
    *   Install the dependencies:
        ```bash
        npm install
        ```

3.  **Running the Application:**
    *   Start the server:
        ```bash
        npm start
        ```
    *   Open your web browser and navigate to `http://localhost:3000`.
    *   Click the "Connect" button to start the session.

## Technology Stack

- **Frontend:** HTML, CSS, Plain JavaScript
- **Backend:** Node.js, Express
- **Real-time Communication:** WebRTC (native browser APIs)
- **API:** OpenAI Realtime API
