# UnityVue Project

A Vue.js application with Vite build tool and Node.js backend.

## Features
- Vue 3 Composition API
- Vite for fast development
- Vue Router for navigation
- Modular component structure
- Example views (Home, Admin)

## Technology Stack
- Frontend: Vue 3, Vite, Vue Router
- Backend: Node.js (Express)
- Build: Vite

## Project Structure
```
f:/zhangjiajun/UnityVue/
├── public/              # Static assets
├── src/
│   ├── assets/          # Project assets
│   ├── components/      # Reusable components
│   ├── router/          # Routing configuration
│   ├── views/           # Page views
│   ├── App.vue          # Main application component
│   ├── main.js          # Application entry point
│   └── style.css        # Global styles
├── index.html           # Main HTML template
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
└── server.js            # Backend server
```

## Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Development
Start development server:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Available Scripts
- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint

## Deployment
1. Build the project:
```bash
npm run build
```
2. Start the server:
```bash
node server.js
```

## Contributing
Pull requests are welcome. Please follow the existing code style.

## License
[MIT](https://choosealicense.com/licenses/mit/)
