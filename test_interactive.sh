#!/bin/bash
# Test script for interactive CLI mode

cd /Users/haos/Projects/azure-psql-app/app/ableton-cli

# Send commands to the interactive CLI
python3 synth2600_cli.py << EOF
help
presets
preset evolving_drone
vco1 440 sawtooth
filter 1200 0.8
patch
export midi test_interactive.mid 4
exit
EOF

echo ""
echo "✓ Test complete!"
ls -lh output/test_interactive.mid
