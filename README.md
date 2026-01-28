# Ngobrolin Web Topic Picker

A fun and interactive web application for randomly selecting discussion topics from the Ngobrolin community. Built with Astro, Tailwind CSS, and TypeScript, this tool features an animated spinning wheel to make topic selection engaging and exciting.

![Ngobrolin Web Topic Picker](https://img.shields.io/badge/Astro-5.16-BC52EE?logo=astro&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38BDF8?logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)

## Features

- **Random Topic Picker**: Spin the wheel to randomly select a discussion topic
- **Animated Spinning Wheel**: Smooth animations with configurable spin duration
- **Topic Sorting**: Organize topics by popularity (votes), recency (ID), or alphabetically
- **Static Data**: Pre-loaded with topics from Ngobrolin community discussions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Fast Performance**: Built with Astro for optimal loading speeds
- **Modern UI**: Clean interface styled with Tailwind CSS v4

## Tech Stack

- **Framework**: [Astro](https://astro.build) - Modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4 - Utility-first CSS framework
- **Language**: [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- **HTML Parsing**: [Cheerio](https://cheerio.js.org) - Fast and flexible HTML parsing

## Quick Start

Get up and running with the Ngobrolin Web Topic Picker in minutes:

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ngobrolin-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321`

## Project Structure

```text
/
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── components/         # Astro components
│   │   └── TopicCard.astro # Individual topic display card
│   ├── data/               # Static data files
│   │   └── topics.ts       # Pre-loaded topic data
│   ├── layouts/            # Layout components
│   │   └── Layout.astro    # Main page layout
│   ├── pages/              # Route pages
│   │   ├── index.astro     # Homepage with topic picker
│   │   └── api/            # API endpoints
│   │       └── topics.ts   # Topics API endpoint
│   └── types/              # TypeScript type definitions
│       └── topic.ts        # Topic interface
├── astro.config.mjs        # Astro configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Development

### Adding New Topics

Topics are stored in `/src/data/topics.ts`. To add a new topic, update the array:

```typescript
{
  id: 95,
  title: "Your New Topic Title",
  url: "https://github.com/orgs/ngobrolin/discussions/95",
  author: "username",
  votes: 0,
  comments: 0,
}
```

### Building for Production

Build your site for deployment:

```bash
npm run build
```

This creates an optimized production build in the `./dist/` directory.

### Preview Production Build

Test your production build locally:

```bash
npm run preview
```

### Available Scripts

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start local development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro ...` | Run Astro CLI commands |

## Deployment

This project generates a static site that can be deployed to any hosting service:

### Vercel

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect Astro and deploy

### Netlify

1. Push your code to GitHub
2. Import your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### GitHub Pages

1. Build the site: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages using:
   - GitHub Actions
   - Manual deployment
   - Third-party tools like `gh-pages`

### Other Platforms

Any static hosting service that serves HTML/CSS/JS files will work:
- Cloudflare Pages
- AWS Amplify
- Firebase Hosting
- Surge.sh
- And many more...

## Customization

### Styling

The project uses Tailwind CSS v4. Customize the appearance by:

1. Modifying Tailwind classes in components
2. Adding custom CSS in component `<style>` blocks
3. Adjusting color schemes and spacing

### Spin Wheel Animation

Adjust the spinning wheel behavior in `/src/pages/index.astro`:
- Spin duration
- Easing functions
- Wheel segments and colors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## About Ngobrolin

[Ngobrolin](https://github.com/orgs/ngobrolin) is an Indonesian developer community where members discuss various web development topics, share knowledge, and collaborate on projects. This tool helps facilitate discussion selection during community meetups and online sessions.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Astro](https://astro.build)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Topics sourced from the [Ngobrolin community](https://github.com/orgs/ngobrolin)
