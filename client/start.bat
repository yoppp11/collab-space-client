@echo off
REM CollabSpace Client - Quick Start Script for Windows

echo Starting CollabSpace Client...
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8000
    ) > .env.local
    echo .env.local created
) else (
    echo .env.local exists
)

echo.
echo Installing dependencies...
call pnpm install

echo.
echo Starting development server...
call pnpm dev
