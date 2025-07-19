#!/usr/bin/env bash
# dev-todo-feature.sh
# Automates Todo feature development workflow for macOS (zsh/bash)
set -euo pipefail

BRANCH="feature/todo"
DOCKER_COMPOSE_FILE="docker-compose.dev.yml"

# Helper for error messages
die() {
  echo "\033[1;31m[ERROR]\033[0m $1" >&2
  exit 1
}

# 1. Create and checkout new branch
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not in a git repository."
git fetch origin || die "Failed to fetch from origin."
git checkout -b "$BRANCH" || git checkout "$BRANCH" || die "Could not create or switch to branch $BRANCH."
echo "[INFO] Switched to branch: $BRANCH"

# 2. Build the app in Docker
docker compose -f "$DOCKER_COMPOSE_FILE" build || die "Docker build failed. Check docker-compose.dev.yml and Docker setup."
echo "[INFO] Docker build complete."

# 3. Run the test suite (frontend + backend)
docker compose -f "$DOCKER_COMPOSE_FILE" run --rm backend npm test || die "Backend tests failed."
docker compose -f "$DOCKER_COMPOSE_FILE" run --rm frontend npm test || die "Frontend tests failed."
echo "[INFO] All tests passed."

# 4. Start the app locally
echo "[INFO] Starting the app..."
docker compose -f "$DOCKER_COMPOSE_FILE" up

# End of script 