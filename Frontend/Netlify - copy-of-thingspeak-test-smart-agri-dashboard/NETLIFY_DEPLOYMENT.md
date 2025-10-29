# Smart Agriculture Dashboard - Netlify Deployment

This is the production-ready version of the Smart Agriculture Dashboard optimized for deployment on Netlify.

## Features

- **Crop Management**: Add, monitor, and manage different crops with AI-powered suggestions
- **IoT Sensor Integration**: Real-time data from ThingSpeak API
- **AI-Powered Insights**: Using Google's Gemini AI for crop recommendations and image generation
- **Multi-language Support**: English, Sinhala, and Tamil
- **Analytics Dashboard**: Comprehensive data visualization and insights
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

- Node.js 18 or higher
- NPM or Yarn package manager
- Google AI API Key (Gemini)

## Local Development

1. **Clone or download this directory**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add:
   ```bash
   GEMINI_API_KEY=your_google_ai_api_key_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Netlify Deployment

### Method 1: Automatic Deployment (Recommended)

1. **Push to Git Repository:**
   - Create a new repository on GitHub, GitLab, or Bitbucket
   - Push this code to the repository

2. **Connect to Netlify:**
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Netlify will automatically detect the build settings from `netlify.toml`

3. **Set Environment Variables:**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add: `GEMINI_API_KEY` with your Google AI API key

4. **Deploy:**
   - Netlify will automatically build and deploy your site
   - Your site will be available at a netlify.app subdomain

### Method 2: Manual Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `dist/` folder to Netlify's deploy page
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## Environment Variables

Set these in Netlify's dashboard under Site settings > Environment variables:

- `GEMINI_API_KEY`: Your Google AI API key for Gemini services

## Configuration Files

- `netlify.toml`: Netlify build and deployment configuration
- `vite.config.ts`: Vite build configuration
- `package.json`: Project dependencies and scripts

## Project Structure

```
├── components/          # Reusable React components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── locales/            # Translation files
├── pages/              # Page components
├── public/             # Static assets
├── services/           # API services and utilities
├── types.ts            # TypeScript type definitions
├── constants.tsx       # Application constants
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── netlify.toml        # Netlify configuration
```

## Troubleshooting

### Build Issues

1. **Environment Variables**: Ensure `GEMINI_API_KEY` is set correctly
2. **Node Version**: Use Node.js 18 or higher
3. **Dependencies**: Run `npm ci` for clean installation

### API Issues

1. **CORS Errors**: The app uses client-side API calls, ensure your API key has proper permissions
2. **Rate Limits**: Google AI APIs have rate limits, implement proper error handling
3. **Billing**: Ensure your Google Cloud account has billing enabled for AI services

### Deployment Issues

1. **Build Errors**: Check the Netlify build logs for specific error messages
2. **Routing**: The `netlify.toml` includes SPA redirect rules
3. **Environment Variables**: Double-check they're set correctly in Netlify

## Performance Optimization

- The app uses Vite for fast builds and hot module replacement
- Static assets are cached with appropriate headers
- Bundle size warnings are shown during build

## Security

- API keys are handled through environment variables
- Security headers are configured in `netlify.toml`
- Content Security Policy can be added if needed

## Support

For issues related to:
- **Netlify Deployment**: Check Netlify documentation
- **Google AI API**: Check Google AI documentation
- **Application Features**: Review the component documentation

## License

This project is part of a Smart Agriculture Business Application.
