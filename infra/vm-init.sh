#!/bin/bash
set -e

# VM Initialization Script for Tracks Processing
# This script runs on first boot to set up the environment

echo "===================================================================="
echo "Starting VM initialization for tracks processing..."
echo "===================================================================="

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    build-essential \
    software-properties-common

# Install Docker
echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add azureuser to docker group
sudo usermod -aG docker azureuser

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Node.js (LTS version)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and pip
echo "Installing Python..."
sudo apt-get install -y python3 python3-pip python3-venv

# ====================================================================
# Audio & Music Production Setup
# ====================================================================
echo "Installing audio processing and music production tools..."

# Install JACK Audio Connection Kit (low-latency audio server)
sudo apt-get install -y \
    jackd2 \
    qjackctl \
    pulseaudio-module-jack

# Install ALSA (Advanced Linux Sound Architecture)
sudo apt-get install -y \
    alsa-utils \
    alsa-tools \
    libasound2-dev

# Install audio processing libraries
sudo apt-get install -y \
    libsndfile1-dev \
    libsamplerate0-dev \
    libportaudio2 \
    portaudio19-dev \
    libportmidi-dev \
    liblo-dev \
    libflac-dev \
    libvorbis-dev \
    libopus-dev \
    libmp3lame-dev

# Install MIDI tools and libraries
sudo apt-get install -y \
    timidity \
    fluidsynth \
    qsynth \
    mididings \
    python3-mido \
    python3-rtmidi

# Install audio plugins and effects
sudo apt-get install -y \
    ladspa-sdk \
    swh-plugins \
    calf-plugins \
    tap-plugins \
    mda-lv2

# Install audio editors and tools
sudo apt-get install -y \
    sox \
    ffmpeg \
    lame \
    vorbis-tools

# Install LV2 plugin support
sudo apt-get install -y \
    lv2-dev \
    lilv-utils

# Install Python audio processing libraries
echo "Installing Python audio libraries..."
pip3 install --break-system-packages \
    mido \
    python-rtmidi \
    midiutil \
    pydub \
    librosa \
    soundfile \
    numpy \
    scipy \
    pretty-midi \
    music21 \
    pyaudio

# Install Node.js audio processing packages globally
echo "Installing Node.js audio packages..."
npm install -g \
    midi \
    node-web-audio-api \
    tone \
    audioworklet

# Install useful tools
echo "Installing useful tools..."
sudo apt-get install -y \
    htop \
    tmux \
    vim \
    wget \
    unzip \
    jq

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/tracks-app
sudo chown azureuser:azureuser /opt/tracks-app

# Create audio working directories
echo "Creating audio working directories..."
sudo mkdir -p /opt/audio-workspace/{projects,samples,midi,exports,plugins}
sudo chown -R azureuser:azureuser /opt/audio-workspace

# Create MIDI instruments directory and download soundfonts
echo "Setting up MIDI soundfonts..."
sudo mkdir -p /usr/share/soundfonts
cd /usr/share/soundfonts
# Download FluidR3 General MIDI SoundFont
sudo wget -q https://keymusician01.s3.amazonaws.com/FluidR3_GM.zip || true
sudo unzip -q FluidR3_GM.zip || true
sudo rm -f FluidR3_GM.zip
cd -

# Configure FluidSynth
cat <<EOF | sudo tee /etc/fluidsynth.conf
# FluidSynth Configuration for Music Production
audio.driver = alsa
audio.periods = 2
audio.period-size = 64
midi.driver = alsa_seq
synth.polyphony = 256
synth.reverb.active = yes
synth.chorus.active = yes
synth.sample-rate = 44100.0
EOF

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Setup firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Node.js app
sudo ufw --force enable

# Create systemd service for the application (placeholder)
echo "Creating systemd service template..."
cat <<EOF | sudo tee /etc/systemd/system/tracks-app.service
[Unit]
Description=Tracks Processing Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=azureuser
WorkingDirectory=/opt/tracks-app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tracks-app

Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Create log directory
sudo mkdir -p /var/log/tracks-app
sudo chown azureuser:azureuser /var/log/tracks-app

# Install monitoring tools
echo "Installing monitoring tools..."
sudo apt-get install -y \
    netdata \
    prometheus-node-exporter

# Enable monitoring services
sudo systemctl enable netdata
sudo systemctl start netdata

# Create a welcome message
cat <<'EOF' | sudo tee /etc/motd
==================================================================
   Azure Tracks Processing VM - feat/tracks branch
   Music Production & DAW Environment
==================================================================

   Application Directory: /opt/tracks-app
   Audio Workspace: /opt/audio-workspace
     ├── projects/  - DAW projects and sessions
     ├── samples/   - Audio samples and loops
     ├── midi/      - MIDI files and patterns
     ├── exports/   - Rendered audio exports
     └── plugins/   - Custom plugins and scripts
   
   Logs Directory: /var/log/tracks-app
   Soundfonts: /usr/share/soundfonts
   
   Services:
   - Docker: sudo systemctl status docker
   - Tracks App: sudo systemctl status tracks-app
   - FluidSynth: fluidsynth -a alsa -m alsa_seq
   - Netdata Monitoring: http://localhost:19999
   
   Audio Tools Available:
   - JACK Audio Server: jackd
   - FluidSynth: MIDI synthesizer
   - SoX: Audio processing
   - FFmpeg: Audio/video encoding
   - Timidity: MIDI player
   
   Python Audio Libraries:
   - mido, python-rtmidi (MIDI I/O)
   - midiutil (MIDI file creation)
   - pydub, librosa (audio processing)
   - pretty-midi, music21 (music analysis)
   
   Quick Commands:
   - View logs: journalctl -u tracks-app -f
   - Restart app: sudo systemctl restart tracks-app
   - List MIDI devices: aplaymidi -l
   - Play MIDI: fluidsynth /usr/share/soundfonts/*.sf2 file.mid
   - Convert audio: sox input.wav output.mp3
   - MIDI to WAV: timidity input.mid -Ow -o output.wav
   
   Deploy Commands:
   - cd /opt/tracks-app
   - git pull && npm install
   - sudo systemctl restart tracks-app
   
==================================================================
EOF

# Clean up
echo "Cleaning up..."
sudo apt-get autoremove -y
sudo apt-get clean

# Display versions
echo "===================================================================="
echo "Installation complete! Installed versions:"
echo "===================================================================="
docker --version
node --version
npm --version
python3 --version
echo "===================================================================="
echo "VM initialization completed successfully!"
echo "===================================================================="

# Reboot to ensure all changes take effect
echo "Rebooting in 10 seconds..."
sleep 10
sudo reboot
