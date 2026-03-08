#!/usr/bin/env bash
set -e

# Project root (absolute path)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cleanup() {
  echo ""
  echo "Stopping servers..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  echo "Done."
}
trap cleanup INT TERM

# --- Backend ---
echo -e "${BLUE}[backend]${NC} Starting FastAPI..."
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo -e "${BLUE}[backend]${NC} Creating virtual environment..."
  python3 -m venv .venv
fi

VENV_PYTHON="$SCRIPT_DIR/backend/.venv/bin/python"

"$VENV_PYTHON" -m pip install -r requirements.txt -q

"$VENV_PYTHON" -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}[backend]${NC} Running on http://localhost:8000  (pid $BACKEND_PID)"

# --- Frontend ---
echo -e "${BLUE}[frontend]${NC} Starting Vite..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}[frontend]${NC} Installing npm packages..."
  npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}[frontend]${NC} Running on http://localhost:5173  (pid $FRONTEND_PID)"

echo ""
echo -e "${GREEN}Both servers are up. Press Ctrl+C to stop.${NC}"
wait
