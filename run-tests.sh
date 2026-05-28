#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "Starting PWA template test stack..."
docker compose -f docker-compose.test.yml up -d --build

echo "Waiting for Next.js..."
for i in {1..60}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3100 2>/dev/null | grep -q "200\|304"; then
    echo "Next.js ready."
    break
  fi
  if [ $i -eq 60 ]; then
    echo "Next.js failed to start."
    docker compose -f docker-compose.test.yml logs nextjs
    docker compose -f docker-compose.test.yml down
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests..."
docker compose -f docker-compose.test.yml run --rm playwright
TEST_EXIT=$?

docker compose -f docker-compose.test.yml down
echo "Done."
exit $TEST_EXIT
