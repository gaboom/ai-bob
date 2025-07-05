# Gemini Project Context: AI-Bob

This file provides context for the AI-Bob project to help AI assistants understand its purpose, architecture, and key decisions.

## Project Goal

The primary goal of this project is to create a simple, yet functional, web application for real-time, bidirectional voice and text conversations with OpenAI's AI models. The user, Gabor, guided the development towards a modern, frontend-driven architecture.

## Core Architecture

This is a single-page application built with plain HTML, CSS, and JavaScript, served by a minimal Node.js backend.

-   **Frontend (`/public`):** The frontend handles all the real-time communication logic. It uses the browser's native `RTCPeerConnection` API to establish a direct WebRTC connection with the OpenAI Realtime API (`https://api.openai.com/v1/realtime`). It does **not** use the `openai` JavaScript SDK, preferring a direct, native implementation.

-   **Backend (`server.js`):** The backend has only one critical function: **secure credential vending**. It exposes a single endpoint (`/api/ephemeral_key`) that the frontend calls to get a short-lived API key. The backend makes a REST `fetch` call to the OpenAI `/v1/realtime/sessions` endpoint, using the permanent `OPENAI_API_KEY` from the `.env` file, and returns the `client_secret.value` to the frontend. This is a deliberate security pattern to avoid exposing the main API key in the browser.

## Key Technology Decisions

-   **No Frontend Frameworks:** The project intentionally uses plain JavaScript, not React, Vue, or other frameworks, to keep it simple and focused on the core API interaction.
-   **No `socket.io`:** Initial versions used `socket.io`, but this was removed in favor of the direct WebRTC connection provided by the OpenAI Realtime API.
-   **Native WebRTC:** The final implementation uses the browser's native `RTCPeerConnection` API, following the pattern of official OpenAI examples. This was a key pivot from earlier attempts that incorrectly tried to use the `openai` SDK on the frontend.
-   **REST API on Backend:** The backend uses a direct `fetch` call to the OpenAI REST API to create the session. This was a necessary correction because the Node.js version of the `openai` SDK did not support the realtime session creation methods at the time of development.

## How to Run

The project is started with `npm start`, which executes `node server.js`. The application is then available at `http://localhost:3000`.
