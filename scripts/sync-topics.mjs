/**
 * Ngobrolin Topic Sync Script
 *
 * Fetches discussions from GitHub and updates the topics data file.
 *
 * Environment variables:
 *   GITHUB_TOKEN - Required for authentication
 *
 * Usage:
 *   node scripts/sync-topics.mjs
 *
 * The script will read GITHUB_TOKEN from:
 *   1. Environment variable
 *   2. .env file in project root (if env var not set)
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..');

// Configuration
const GITHUB_ORG = 'ngobrolin';
const ENV_FILE = resolve(PROJECT_ROOT, '.env');

/**
 * Load environment variables from .env file
 * Only loads if GITHUB_TOKEN is not already set
 */
function loadEnvFile() {
  if (process.env.GITHUB_TOKEN) {
    return; // Already set, don't override
  }

  if (!existsSync(ENV_FILE)) {
    return; // No .env file
  }

  const content = readFileSync(ENV_FILE, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    // Parse KEY=VALUE format
    const match = trimmed.match(/^GITHUB_TOKEN=(.+)$/);
    if (match) {
      process.env.GITHUB_TOKEN = match[1].trim();
      break;
    }
  }
}

/**
 * Fetch discussions from GitHub using the GraphQL API
 */
async function fetchDiscussions() {
  // Load from .env if not already set
  loadEnvFile();

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error('Error: GITHUB_TOKEN environment variable is not set');
    console.error('\nPlease set your GitHub Personal Access Token:');
    console.error('\nOption 1 - Create .env file:');
    console.error('  1. Copy .env.example to .env');
    console.error('  2. Add: GITHUB_TOKEN=ghp_your_token_here');
    console.error('\nOption 2 - Export directly:');
    console.error('  export GITHUB_TOKEN=ghp_your_token_here');
    process.exit(1);
  }

  const query = `
    query {
      organization(login: "${GITHUB_ORG}") {
        repositories(first: 1) {
          nodes {
            discussions(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                number
                title
                url
                author {
                  login
                }
                upvoteCount
                comments(first: 1) {
                  totalCount
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error('GitHub API error: ' + response.status + ' - ' + error);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error('GraphQL errors: ' + JSON.stringify(data.errors));
  }

  // Extract discussions from response
  const discussions = data.data.organization.repositories.nodes[0]?.discussions.nodes || [];
  
  return discussions.map(d => ({
    id: d.number,
    title: d.title,
    url: d.url,
    author: d.author?.login || 'unknown',
    votes: d.upvoteCount,
    comments: d.comments.totalCount,
  }));
}

/**
 * Generate TypeScript file content with topics data
 */
function generateTopicsFile(topics) {
  const sortedTopics = topics.sort((a, b) => b.id - a.id);
  const topicsArray = JSON.stringify(sortedTopics, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  return "import type { Topic } from '../types/topic';\n\n" +
         "export const topics: Topic[] = " + topicsArray + ";\n";
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Fetching discussions from GitHub...');
    const discussions = await fetchDiscussions();
    console.log('Found ' + discussions.length + ' discussions');

    const topicsFile = resolve(PROJECT_ROOT, 'src/data/topics.ts');
    const content = generateTopicsFile(discussions);

    writeFileSync(topicsFile, content, 'utf-8');
    console.log('Updated: ' + topicsFile);
    console.log('Total topics: ' + discussions.length);
  } catch (error) {
    console.error('Error syncing topics:', error.message);
    process.exit(1);
  }
}

main();
