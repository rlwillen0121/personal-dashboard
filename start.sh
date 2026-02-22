#!/bin/bash
set -e

PORT=3000

# Kill any process using the port
echo "Checking for processes on port $PORT..."
if command -v fuser &> /dev/null; then
    fuser -k ${PORT}/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    lsof -ti:${PORT} | xargs -r kill -9 2>/dev/null || true
else
    # Use ss as fallback
    pids=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | sed -n 's/.*pid=\([^,]*\).*/\1/p')
    if [ -n "$pids" ]; then
        echo "Killing processes: $pids"
        kill -9 $pids 2>/dev/null || true
    fi
fi

# Wait a moment for port to be released
sleep 1

echo "Starting dashboard..."

# Set PM2_READY_FILE so PM2 knows to wait for the ready signal
if [ -n "$PM2_SCRIPT_PATH" ]; then
    export PM2_READY_FILE="$PM2_SCRIPT_PATH.ready"
fi

exec npm start
