#!/usr/bin/env bash

echo "Terminal Font Dimension Checker"
echo "=================================="
echo ""

# Get terminal size in characters
TERM_COLS=$(tput cols)
TERM_LINES=$(tput lines)

echo "Terminal size: ${TERM_COLS} columns × ${TERM_LINES} lines"
echo ""

# Try to get pixel dimensions (works on some terminals)
if command -v osascript >/dev/null 2>&1; then
    echo "Attempting to get macOS terminal pixel size..."
    # This works on macOS Terminal app
    PIXEL_INFO=$(osascript -e 'tell application "Terminal" to get bounds of front window' 2>/dev/null || echo "")
    if [[ -n "$PIXEL_INFO" ]]; then
        echo "Terminal window bounds: $PIXEL_INFO"
    else
        echo "Could not get pixel dimensions automatically"
    fi
fi

echo ""
echo "Common Font Character Ratios:"
echo "Monaco/Menlo (macOS):     7×14px  (1:2.0)  → For square: W = H × 2.0"
echo "Consolas (Windows):       7×14px  (1:2.0)  → For square: W = H × 2.0"
echo "JetBrains Mono:           8×14px  (1:1.75) → For square: W = H × 1.75"
echo "DejaVu Sans Mono:         7×13px  (1:1.86) → For square: W = H × 1.86"
echo ""

echo "Recommended Shader Dimensions for your terminal:"
echo ""

# Calculate recommendations for different aspect ratios
HEIGHT=50  # Base height that fits most terminals

# For typical 1:2 font ratio
SQUARE_WIDTH=$((HEIGHT * 2))
WIDESCREEN_WIDTH=$((HEIGHT * 178 / 100 / 2))  # 16:9 compensated
CLASSIC_WIDTH=$((HEIGHT * 133 / 100 / 2))     # 4:3 compensated

echo "For SQUARE appearance:"
echo "-- Shader dimensions: ${SQUARE_WIDTH}x${HEIGHT}  (assumes 1:2 font ratio)"
echo ""

echo "For 16:9 WIDESCREEN appearance:"
echo "-- Shader dimensions: ${WIDESCREEN_WIDTH}x${HEIGHT}  (visually 16:9)"
echo ""

echo "For 4:3 CLASSIC appearance:"
echo "-- Shader dimensions: ${CLASSIC_WIDTH}x${HEIGHT}  (visually 4:3)"
echo ""

echo "To measure your exact font:"
echo "1. Count pixels in a full-screen terminal"
echo "2. Divide by character count"
echo "3. Adjust ratios accordingly"