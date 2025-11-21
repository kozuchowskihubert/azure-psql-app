#!/usr/bin/env bash
# Build and run the app locally in Docker. Provide DATABASE_URL in env.
if [ -z "$DATABASE_URL" ]; then
  echo "Set DATABASE_URL environment variable before running. Example: export DATABASE_URL=postgresql://user:pass@host:5432/dbname"
  exit 1
fi

docker build -t azure-psql-app:local .
docker run --rm -p 3000:3000 -e DATABASE_URL="$DATABASE_URL" azure-psql-app:local
