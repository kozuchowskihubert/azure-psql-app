FROM node:20-alpine

# Install Python3 and required packages for music production features
RUN apk add --no-cache \
    python3 \
    py3-pip \
    && ln -sf python3 /usr/bin/python

WORKDIR /usr/src/app

# Copy and install Node.js dependencies
COPY app/package.json app/package-lock.json* ./
RUN npm ci --production

# Copy application files
COPY app/ .

# Install Python dependencies for music production CLI
RUN if [ -f ableton-cli/requirements.txt ]; then \
    pip3 install --no-cache-dir -r ableton-cli/requirements.txt; \
    fi

EXPOSE 3000
CMD ["node","index.js"]
