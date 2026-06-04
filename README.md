# MediCheck Healthcare Kiosk - Full Stack Assessment

## 📌 Project Overview
The MediCheck Healthcare Kiosk is a highly responsive, single-page full-stack application designed for patient self-check-in and administrative triage. 

Built with a strict 3-tier architecture, the system relies on a React/Vite frontend client, a Python FastAPI backend for logic and routing, and a local SQLite database for persistent storage. The UI is meticulously styled for a 10-inch tablet in landscape mode, utilizing a clean, high-contrast monochrome design theme.

---

## 🏗️ Architecture & Tech Stack
- **Frontend (Client):** React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend (API):** Python 3, FastAPI, Uvicorn, Pydantic
- **Database:** SQLite (Local)
- **State Management:** Centralized React state machine (Welcome ↔ Success ↔ Admin)

---

## ✨ High-Impact UX & Product Enhancements
Beyond the core requirements, this application includes several senior-level UX features designed specifically for the realities of a physical medical kiosk and a fast-paced triage desk:

### 1. Kiosk-Native Touch Interactions
- **Custom On-Screen Numpad:** Standard browser keyboards are clunky on tablets. A custom, large-button on-screen number pad dynamically renders for the "Age" and "Mobile" fields to drastically improve accessibility and input speed.

### 2. Advanced Patient Privacy
- **Animated Privacy Shield:** A 30-second background inactivity timer monitors the registration form. If a patient walks away halfway through, the system triggers a 3-second animated visual countdown with an "I'm still here" escape button before automatically clearing all PHI (Protected Health Information) from the screen.
- **Auto-Clearing Token Screen:** The Success view utilizes `requestAnimationFrame` for a fluid, smooth 10-second progress bar, ensuring the viewport automatically clears and resets for the next patient.

### 3. Live Admin Triage & Management
- **Priority Triage:** A Normal/Urgent toggle on the registration form flags urgent patients with a distinct visual badge across the dashboard.
- **Summary KPI Strip:** Real-time metrics track *Today's Total, Waiting, Completed,* and *Urgent* counts alongside department-specific workloads.
- **Inline Status Management:** Admins can transition patient states (`Waiting` → `In Progress` → `Completed` → `Cancelled`) directly from a dropdown in the table row, with changes persisting instantly to the FastAPI backend.
- **Advanced Filtering:** Real-time search by Patient Name or Auto-generated Token (`A001`), combined with Department and Status dropdown filters.

---

## 🚀 Local Environment Setup

Follow these exact steps to spin up the local environment. **Please start the backend server first.**

### Step 1: Start the Backend (FastAPI + SQLite)
1. Open a terminal and navigate to the backend directory.
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
Install dependencies:
Bash
pip install -r requirements.txt
Run the server:
Bash
uvicorn main:app --reload
The API will now be running on http://localhost:8000 and will automatically generate the local patients.db SQLite file.
Step 2: Start the Frontend (React)
Open a new terminal window and navigate to the frontend directory.
Install Node dependencies:
Bash
npm install
Run the Vite development server:
Bash
npm run dev
The application will now be running on http://localhost:5173.
