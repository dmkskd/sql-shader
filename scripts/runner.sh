#!/usr/bin/env bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Shader file is always in the scripts directory
# Argument can be just the filename (e.g., "worm_hole.sql") or full name
SHADER_NAME="${1:-squircle2.sql}"
SHADER_FILE="$SCRIPT_DIR/$SHADER_NAME"

# Use environment variable for password - no defaults needed
# The calling environment (justfile) will set CLICKHOUSE_PASSWORD

# Extract dimensions and check terminal size
DIMENSIONS=$(grep -o '[0-9]\+x[0-9]\+' "$SHADER_FILE" | head -1)
WIDTH=${DIMENSIONS%x*}; HEIGHT=${DIMENSIONS#*x}; WIDTH=${WIDTH:-160}; HEIGHT=${HEIGHT:-100}
TERM_COLS=$(tput cols); TERM_LINES=$(tput lines)
EXPECTED_COLS=$((WIDTH + 2)); EXPECTED_LINES=$((HEIGHT + 3))

# Warn if terminal too small
if [ "$TERM_COLS" -lt "$EXPECTED_COLS" ] || [ "$TERM_LINES" -lt "$EXPECTED_LINES" ]; then
    echo "⚠️  Terminal too small: need ${EXPECTED_COLS}x${EXPECTED_LINES}, have ${TERM_COLS}x${TERM_LINES}"
    echo "Resize terminal or press Enter to continue anyway..."; read -r
fi

# capture initial time (seconds with nanoseconds precision)
t0=$(date +%s.%N)
# enter alt screen, hide cursor, disable wrap
tput smcup; tput civis; tput rmam
trap 'tput smam; tput cnorm; tput rmcup' EXIT

# Main loop
while true; do
  frame_start=$(date +%s.%N)
  
  # Execute shader using Docker ClickHouse client
  # Use environment variable expansion inside container to avoid command line exposure
  output=$(docker exec -e CLICKHOUSE_PASSWORD pixelql-clickhouse \
    sh -c 'clickhouse client \
      --hardware-utilization \
      --password="$CLICKHOUSE_PASSWORD" \
      --param_t0="'"$t0"'" \
      --param_width="'"$WIDTH"'" \
      --param_height="'"$HEIGHT"'" \
      --query "'"$(cat "$SHADER_FILE")"'" \
      --format=LineAsString')
  
  # Calculate stats
  frame_end=$(date +%s.%N)
  dt=$(awk -v a="$frame_start" -v b="$frame_end" 'BEGIN{d=b-a; if(d<=0) d=1e-6; printf "%.3f", d}')
  fps=$(awk -v d="$dt" 'BEGIN{ if(d>0){ printf "%.1f", 1.0/d } else { print "inf" } }')
  status_text="FPS: ${fps}  frame: ${dt}s  size: ${WIDTH}x${HEIGHT}"
  
  # High-performance rendering: build frame buffer and write atomically
  frame_buffer=$(printf '%s\n%s' "$status_text" "$output")
  printf '\033[H%s' "$frame_buffer"
   
  sleep 0.01
done
