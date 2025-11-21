FROM node:20-alpine

# Build arguments for cache busting
ARG BUILD_DATE
ARG VCS_REF
LABEL build_date="${BUILD_DATE}" \
      vcs_ref="${VCS_REF}" \
      description="Enterprise Productivity Suite - Notes App"

WORKDIR /usr/src/app

# Copy and install Node.js dependencies
COPY app/package.json app/package-lock.json* ./
RUN npm ci --production

# Copy application files
COPY app/ .

EXPOSE 3000
CMD ["node","index.js"]
