# GitHub Discussions Sync System

## Overview

The sync system automates the process of fetching discussion data from the Ngobrolin GitHub repository and updating the static topics data file (`src/data/topics.ts`). This ensures the topic picker application always has the latest discussion data.

## Usage

### Local Execution

To run the sync script locally, you need a GitHub Personal Access Token:

```bash
npm run sync-topics
```

**Prerequisites:**
- Set the `GITHUB_TOKEN` environment variable with your GitHub Personal Access Token
- The token must have the `public_repo` scope (for public repositories)

**Setup Options:**

**Option 1 - Using .env file (Recommended):**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your token
# GITHUB_TOKEN=ghp_your_token_here

# Run sync (will automatically read from .env)
npm run sync-topics
```

**Option 2 - Using environment variable:**
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
npm run sync-topics
```

**Option 3 - Inline (one-time):**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx npm run sync-topics
```

### GitHub Actions

The sync system can be automated via GitHub Actions in two ways:

#### 1. Manual Trigger

1. Go to the **Actions** tab in your GitHub repository
2. Select **"Sync GitHub Discussions"** workflow
3. Click **"Run workflow"** button
4. Choose the branch (usually `main`)
5. Click **"Run workflow"** to execute

#### 2. Scheduled Execution

The workflow is configured to run automatically:
- **Schedule**: Every Tuesday at 7:00 PM GMT+7
- **Timezone**: Asia/Jakarta
- **Branch**: `main`

No manual intervention required once configured.

## Environment Variables

### GITHUB_TOKEN

**Required**: Yes

**Description**: GitHub Personal Access Token for authenticating API requests.

**For Local Usage:**
1. Visit [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Select the `public_repo` scope
4. Generate and copy the token

Then choose one of these methods:

**Method A - Create .env file (Recommended):**
```bash
# Copy example file
cp .env.example .env

# Add your token to .env
echo "GITHUB_TOKEN=ghp_your_token_here" > .env

# Run sync (reads from .env automatically)
npm run sync-topics
```

**Method B - Export environment variable:**
```bash
export GITHUB_TOKEN=ghp_your_token_here
npm run sync-topics
```

**For GitHub Actions:**
- Automatically provided by GitHub Actions
- Uses the built-in `GITHUB_TOKEN` with repository permissions
- No manual configuration required

## How It Works

### Architecture

```
GitHub GraphQL API
    ↓
Node.js Sync Script (scripts/sync-topics.mjs)
    ↓
Parse & Transform Data
    ↓
Generate TypeScript File (src/data/topics.ts)
    ↓
Git Commit & Push (GitHub Actions only)
```

### Process Flow

1. **Fetch Discussions**
   - Makes a POST request to GitHub GraphQL API
   - Queries the `ngobrolin` organization's discussions
   - Retrieves up to 100 discussions with metadata: author, upvotes, comments

2. **Parse Data**
   - Extracts relevant fields from each discussion
   - Maps GraphQL response to TypeScript `Topic` interface
   - Sorts by discussion ID (newest first)

3. **Generate TypeScript**
   - Creates a properly formatted TypeScript file
   - Imports the `Topic` type definition
   - Exports a `topics` array with type annotations
   - Maintains consistent formatting (2-space indentation, single quotes)

4. **Commit Changes** (GitHub Actions only)
   - Stages the updated `src/data/topics.ts` file
   - Creates a git commit with message: `chore: sync topics from GitHub Discussions`
   - Pushes changes to the repository

## Data Mapping

### API Response Fields to TypeScript Types

| GraphQL Field | TypeScript Field | Type | Description |
|---------------|-----------------|------|-------------|
| `number` | `id` | `number` | Discussion number (unique ID) |
| `title` | `title` | `string` | Discussion title |
| `url` | `url` | `string` | Full URL to the discussion |
| `author.login` | `author` | `string` | GitHub username of author |
| `upvoteCount` | `votes` | `number` | Number of upvotes/reactions |
| `comments.totalCount` | `comments` | `number` | Number of comments |

### TypeScript Output Format

```typescript
import type { Topic } from '../types/topic';

export const topics: Topic[] = [
  {
    id: 95,
    title: "Discussion Title",
    url: "https://github.com/orgs/ngobrolin/discussions/95",
    author: "username",
    votes: 5,
    comments: 3,
    category: "category-name"
  },
  // ... more topics
];
```

## Troubleshooting

### Common Issues and Solutions

#### `jq: command not found`

**Cause**: The `jq` utility is not installed on your system.

**Solution**:
- **macOS**: `brew install jq`
- **Ubuntu/Debian**: `sudo apt-get install jq`
- **Fedora**: `sudo dnf install jq`
- **Windows**: Download from [stedolan.github.io/jq](https://stedolan.github.io/jq/)

#### `curl: command not found`

**Cause**: The `curl` utility is not installed on your system.

**Solution**:
- **macOS**: Usually pre-installed. If missing, install via Homebrew
- **Ubuntu/Debian**: `sudo apt-get install curl`
- **Fedora**: `sudo dnf install curl`
- **Windows**: Download from [curl.se](https://curl.se/)

#### `401 Unauthorized`

**Cause**: Invalid or missing `GITHUB_TOKEN`.

**Solution**:
1. Verify the token is set: `echo $GITHUB_TOKEN`
2. Check token has `public_repo` scope
3. Regenerate token if expired
4. Ensure no extra spaces in token value

#### `403 Rate Limit Exceeded`

**Cause**: GitHub API rate limit exceeded (60 requests/hour for unauthenticated, 5000 for authenticated).

**Solution**:
1. Ensure `GITHUB_TOKEN` is set (increases limit to 5000/hour)
2. Wait for rate limit to reset (hourly)
3. Check current rate limit: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`

#### `422 Unprocessable Entity`

**Cause**: Invalid API request parameters or malformed data.

**Solution**:
1. Check API endpoint URL is correct
2. Verify organization name (`ngobrolin`) is accurate
3. Check for any breaking changes in GitHub API

#### Git Commit Fails

**Cause**: Local changes not committed, or branch is behind remote.

**Solution**:
1. Commit or stash local changes first: `git stash` or `git commit`
2. Pull latest changes: `git pull`
3. Re-run sync script

### Debugging

To enable debug output, modify the script to add verbose flags:

```bash
# Add -v flag to curl for verbose output
curl -v -H "Authorization: token $GITHUB_TOKEN" ...

# Add set -x at the top of the script for command tracing
set -x
```

## Dependencies

### Required Software

- **Node.js**: Version 18 or higher (for running the sync script)
- **npm**: Comes with Node.js

### System Requirements

- **Operating System**: Linux, macOS, or Windows
- **Memory**: Minimal (script is lightweight)
- **Network**: Active internet connection for GitHub API access

## GitHub Actions Configuration

The workflow file (`.github/workflows/sync-topics.yml`) includes:

```yaml
name: Sync GitHub Discussions

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 12 * * 2'  # Every Tuesday at 12:00 UTC (7:00 PM GMT+7)

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - run: npm run sync-topics
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Check for changes
        run: git status --porcelain src/data/topics.ts

      - name: Commit and push
        if: steps.verify-changed.outputs.changed == 'true'
        run: |
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git config user.name "github-actions[bot]"
          git add src/data/topics.ts
          git commit -m "chore: sync topics from GitHub Discussions"
          git push
```

### Permissions

The workflow requires the following GitHub Actions permissions:
- `contents: write` - To commit and push changes to the repository

## Best Practices

1. **Test Locally First**: Run the script locally before deploying to GitHub Actions
2. **Monitor Logs**: Check GitHub Actions logs regularly for any failures
3. **Backup Data**: Keep a backup of `src/data/topics.ts` before running sync
4. **Review Changes**: Review git commits to ensure data integrity
5. **Rate Limiting**: Be mindful of GitHub API rate limits when testing frequently

## Contributing

When modifying the sync system:

1. Update this README with any changes to behavior or dependencies
2. Test both local execution and GitHub Actions workflow
3. Ensure backward compatibility with existing data
4. Document any new environment variables or configuration options

## Support

For issues or questions:
1. Check this README's troubleshooting section
2. Review GitHub Actions logs
3. Open an issue in the repository
4. Contact the Ngobrolin team

---

**Last Updated**: January 2026
**Maintained By**: Ngobrolin Team
**License**: See project repository
