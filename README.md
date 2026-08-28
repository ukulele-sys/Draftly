# Draftly

An intelligent email companion that automatically summarizes, categorizes, and drafts replies for your Gmail inbox — powered by Google's Gemini API and Firebase.

## Features

- **Automatic summarization** — quickly understand what an email is about without reading the whole thing
- **Smart categorization** — emails get sorted so your inbox stays organized
- **AI-drafted replies** — get a starting point for responses instead of writing from scratch
- Built with Firebase for auth/data and Gemini for the AI layer

## Tech Stack

- TypeScript
- Vite
- Firebase (Auth / Database)
- Google Gemini API

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed (this project uses `bun.lock`)
- A Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)
- A Firebase project (for auth/database features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ukulele-sys/Draftly.git
   cd Draftly
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Set up environment variables

   Copy `.env.example` to `.env` and fill in your own values:
   ```bash
   cp .env.example .env
   ```

   You'll need to add your `GEMINI_API_KEY` here. **Never commit your real `.env` file.**

4. Run the app
   ```bash
   bun run dev
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key, used server-side to generate summaries and draft replies |

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
