# 🗓️ ChronosAI - AI Daily Planner

> **Turn raw priorities into a realistic day plan with focused tasks.**

ChronosAI is an intelligent, privacy-focused daily planner and focus execution app. It balances your daily workload against available focus hours, aligns high-impact tasks with your peak energy windows, and provides real-time schedule re-balancing alongside an ambient focus timer.

---

## 🌟 Key Features

- **🧠 Energy Peak Optimization**: Automatically schedules heavy deep work during your peak focus window (Morning Lark, Afternoon Burst, Evening Owl, or Steady Flow).
- **💬 Natural Language AI Day Parser**: Paste any raw description or prompt (e.g. *"Standup at 10am, 2 hours to code API endpoint, review PRs before lunch"*) and let AI extract structured tasks, durations, and fixed commitments.
- **📊 Daily Workload Capacity Meter**: Live progress meter preventing over-commitment against your working hours.
- **⏱️ Focus Mode & Web Audio Synth**: Distraction-free Pomodoro timer with built-in ambient white noise generator (Brown Noise, Pink Noise, Binaural Beats, Chimes) using standard Web Audio API (zero external MP3 downloads).
- **⚡ Instant Schedule Re-balancing**: Click *"Finished Early!"* or *"+15 Mins"* to dynamically recalculate and shift subsequent time blocks without manual effort.
- **📝 Distraction Scratchpad**: Offload stray thoughts instantly into a lightweight dump drawer so you stay in flow state.
- **📈 Day Analytics & Export**: Calculate your **Focus Score**, copy 1-click **Markdown Daily Standup summaries**, or export your schedule as `.ICS` calendar files for Google / Apple Calendar.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- `npm` or `pnpm`

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-daily-planner.git
   cd ai-daily-planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local dev server**:
   ```bash
   npx vite
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

---

## 🛠️ Built With

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Effects & Audio**: Web Audio API Synth & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **live link**:https://chronosai-psi.vercel.app/

---

## ⚙️ Optional Gemini AI Setup

1. Click the **Settings** icon (top right) in the application.
2. Enter your optional **Gemini API Key**.
3. Enjoy enhanced natural language task parsing and breakdown!

---

## 📄 License

MIT License © 2026 ChronosAI
