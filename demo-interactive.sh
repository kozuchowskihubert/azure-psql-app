#!/bin/bash
# Interactive Demo for Behringer 2600 CLI

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         Behringer 2600 Interactive CLI Demo                  ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "This demo shows the interactive mode capabilities."
echo "Press Ctrl+C to exit at any time, or type 'exit' to quit gracefully."
echo ""
echo "Starting interactive shell..."
echo ""

cd "$(dirname "$0")/app/ableton-cli"

# Run interactive mode
python3 synth2600_cli.py -i
