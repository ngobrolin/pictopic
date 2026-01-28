#!/bin/bash

###############################################################################
# Ngobrolin Topic Sync Script
#
# This script fetches the latest discussions from the Ngobrolin GitHub
# organization and updates the static topics data file.
#
# ENVIRONMENT VARIABLES REQUIRED:
#   GITHUB_TOKEN - Personal Access Token with read access to discussions
#                  Create one at: https://github.com/settings/tokens
#
# USAGE:
#   GITHUB_TOKEN=your_token npm run sync-topics
#
# OR export the token first:
#   export GITHUB_TOKEN=your_token
#   npm run sync-topics
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}Error: GITHUB_TOKEN environment variable is not set${NC}"
    echo ""
    echo "Please set your GitHub Personal Access Token:"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo ""
    echo "Then run:"
    echo "  npm run sync-topics"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Fetching topics from GitHub Discussions...${NC}"

# Run the Node.js sync script
node "$SCRIPT_DIR/sync-topics.mjs"

echo -e "${GREEN}✓ Topics synced successfully!${NC}"
echo ""
echo "Updated file: $PROJECT_ROOT/src/data/topics.ts"
