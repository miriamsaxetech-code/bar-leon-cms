#!/usr/bin/env bash
# León Display v1 — Master Runner
# Usage: ./run.sh [phase] [weight]
#   phase: 1 | 2 | 3 | inspect | all
#   weight: Bold | Medium (default: Bold)
#
# Examples:
#   ./run.sh 1 Bold        # Prepare SFD for Bold
#   ./run.sh 2 Bold        # Build composites for Bold (after drawing marks)
#   ./run.sh 3 Bold        # Generate output fonts for Bold
#   ./run.sh inspect Bold  # Print current glyph inventory
#   ./run.sh all Bold      # Run phases 1+2+3 in sequence

set -e

PHASE="${1:-inspect}"
WEIGHT="${2:-Bold}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Locate fontforge binary
if command -v fontforge &>/dev/null; then
    FF="fontforge"
elif [ -f "/Applications/FontForge.app/Contents/MacOS/FontForge" ]; then
    FF="/Applications/FontForge.app/Contents/MacOS/FontForge"
else
    echo "ERROR: FontForge not found."
    echo "Install with:  brew install fontforge"
    exit 1
fi

echo "Using FontForge: $(which $FF 2>/dev/null || echo $FF)"
echo "Weight: $WEIGHT"
echo ""

case "$PHASE" in
    1)
        echo "=== Phase 1: Prepare SFD ==="
        "$FF" -script "$SCRIPT_DIR/01_prepare_sfd.py" "$WEIGHT"
        ;;
    2a)
        echo "=== Phase 2a: Draw Combining Marks ==="
        "$FF" -script "$SCRIPT_DIR/02a_draw_marks.py" "$WEIGHT"
        ;;
    2)
        echo "=== Phase 2: Build Composites ==="
        "$FF" -script "$SCRIPT_DIR/02_build_composites.py" "$WEIGHT"
        ;;
    3)
        echo "=== Phase 3: Generate Fonts ==="
        "$FF" -script "$SCRIPT_DIR/03_generate.py" "$WEIGHT"
        ;;
    inspect)
        echo "=== Inspecting SFD ==="
        "$FF" -script "$SCRIPT_DIR/04_inspect_sfd.py" "$WEIGHT"
        ;;
    all)
        echo "=== Running all phases for $WEIGHT ==="
        "$FF" -script "$SCRIPT_DIR/01_prepare_sfd.py" "$WEIGHT"
        echo ""
        echo "=== Phase 2a: Drawing combining marks (scripted) ==="
        "$FF" -script "$SCRIPT_DIR/02a_draw_marks.py" "$WEIGHT"
        echo ""
        "$FF" -script "$SCRIPT_DIR/02_build_composites.py" "$WEIGHT"
        echo ""
        echo "NOTE: Composites built. Bespoke glyphs (AE, OE, ß, ¡, ¿, punctuation)"
        echo "can be drawn in FontForge and Phase 3 re-run at any time."
        echo ""
        "$FF" -script "$SCRIPT_DIR/03_generate.py" "$WEIGHT"
        ;;
    both-weights)
        echo "=== Running Phase 1 for both weights ==="
        "$FF" -script "$SCRIPT_DIR/01_prepare_sfd.py" "Bold"
        "$FF" -script "$SCRIPT_DIR/01_prepare_sfd.py" "Medium"
        echo ""
        echo "Both SFDs prepared. Draw marks in both, then run:"
        echo "  ./run.sh 2 Bold && ./run.sh 2 Medium"
        ;;
    *)
        echo "Usage: ./run.sh [1|2|3|inspect|all|both-weights] [Bold|Medium]"
        exit 1
        ;;
esac
