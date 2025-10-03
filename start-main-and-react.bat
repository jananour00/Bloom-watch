@echo off
REM Start the bloompage Next.js app in a new terminal
start cmd /k "cd bloompage && npm run dev"


REM Start the AI Next.js app in a new terminal
start cmd /k "cd AI && npm run dev -- -p 3002"


REM Start the main Next.js app in a new terminal
start cmd /k "cd main && npm run dev -- -p 3001"


REM Start the React Router app in the current terminal
npm run dev
