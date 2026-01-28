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

**Example:**
```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxx
npm run sync-topics
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
5. Set as environment variable:
   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   ```

**For GitHub Actions:**
- Automatically provided by GitHub Actions
- Uses the built-in `GITHUB_TOKEN` with repository permissions
- No manual configuration required

## How It Works

### Architecture

```
GitHub REST API
    ↓
Sync Script (scripts/sync-topics.sh)
    ↓
Parse & Transform Data
    ↓
Generate TypeScript File (src/data/topics.ts)
    ↓
Git Commit & Push
```

### Process Flow

1. **Fetch Discussions**
   - Makes a GET request to GitHub REST API: `orgs/ngobrolin/discussions`
   - Retrieves all discussions with pagination support
   - Includes metadata: author, reactions, comments, labels

2. **Parse Data**
   - Extracts relevant fields from each discussion
   - Handles pagination to fetch all discussions
   - Filters out closed or irrelevant discussions (if needed)

3. **Generate TypeScript**
   - Creates a properly formatted TypeScript file
   - Imports the `Topic` type definition
   - Exports a `topics` array with type annotations
   - Maintains consistent formatting (2-space indentation)

4. **Commit Changes**
   - Stages the updated `src/data/topics.ts` file
   - Creates a git commit with a descriptive message
   - Pushes changes to the repository
   - Commit format: `chore: sync topics from GitHub Discussions [date]`

## Data Mapping

### API Response Fields to TypeScript Types

| GitHub API Field | TypeScript Field | Type | Description |
|-----------------|-----------------|------|-------------|
| `node_id` | `id` | `number` | Unique discussion ID (extracted from node_id) |
| `title` | `title` | `string` | Discussion title |
| `html_url` | `url` | `string` | Full URL to the discussion |
| `user.login` | `author` | `string` | GitHub username of author |
| `reactions.total_count` | `votes` | `number` | Total reaction count (thumbs up, etc.) |
| `comments` | `comments` | `number` | Number of comments |
| `labels[*].name` | `category` | `string` | First label as category (optional) |

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

- **Bash**: Version 4.0 or higher
- **curl**: For making HTTP requests to GitHub API
- **jq**: Version 1.6+ for JSON parsing and manipulation
- **git**: For committing and pushing changes

### System Requirements

- **Operating System**: Linux, macOS, or Windows (with WSL or Git Bash)
- **Memory**: Minimal (script is lightweight)
- **Network**: Active internet connection for GitHub API access

## GitHub Actions Configuration

The workflow file (`.github/workflows/sync-topics.yml`) includes:

```yaml
name: Sync GitHub Discussions

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 12 * * 2'  # Every Tuesday at 7pm GMT+7

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync topics
        run: ./scripts/sync-topics.sh
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Permissions

The workflow requires the following GitHub Actions permissions:
- `contents: write` - To commit changes to the repository
- `pull-requests: write` - If creating PRs instead of direct commits

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
