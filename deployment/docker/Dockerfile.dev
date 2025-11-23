FROM node:20-alpine

# Build arguments for cache busting
ARG BUILD_DATE
ARG VCS_REF
LABEL build_date="${BUILD_DATE}" \
      vcs_ref="${VCS_REF}" \
      description="Notes App with Music Production Features"

# Install Python3 and required packages for music production features
# Updated: 2025-11-21 - Added Python3 support for Techno Studio CLI
RUN apk add --no-cache \
    python3 \
    py3-pip \
    && ln -sf python3 /usr/bin/python \
    && python3 --version \
    && pip3 --version

WORKDIR /usr/src/app

# Copy and install Node.js dependencies
COPY app/package.json app/package-lock.json* ./
RUN npm ci --production

# Copy application files
COPY app/ .

# Verify ableton-cli directory exists and show contents
RUN ls -la ableton-cli/ || echo "ableton-cli directory not found"

# Install Python dependencies for music production CLI
RUN if [ -f ableton-cli/requirements.txt ]; then \
    echo "Installing Python dependencies from ableton-cli/requirements.txt..." && \
    cat ableton-cli/requirements.txt && \
    pip3 install --break-system-packages --no-cache-dir -r ableton-cli/requirements.txt && \
    echo "✅ Python packages installed:" && \
    pip3 list; \
    else \
    echo "⚠️  No requirements.txt found at ableton-cli/requirements.txt"; \
    ls -la ableton-cli/; \
    fi

# Verify Python is available
RUN python3 --version && echo "✅ Python3 installed successfully"

EXPOSE 3000
CMD ["node","index.js"]
