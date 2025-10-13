# 🚀 CodeReview.AI

**AI-Powered Code Review Platform** - Analyze code for security vulnerabilities, performance issues, and quality metrics using advanced AI.

![CodeReview.AI](https://img.shields.io/badge/AI-Powered-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

---

## ✨ Features

### 🔒 Security Analysis

- **OWASP Top 10 2021** compliance checking
- Vulnerability detection with severity ratings
- CWE mapping and fix suggestions
- Real-time security scoring

### 📊 Code Quality

- Cyclomatic complexity analysis
- Maintainability index calculation
- Code smell detection
- Technical debt estimation

### ⚡ Performance Optimization

- Inefficient loop detection
- Memory leak identification
- N+1 query detection
- Performance score calculation

### 🤖 AI-Powered Suggestions

- Refactoring recommendations
- Security fix suggestions
- Performance improvements
- Modern coding patterns

### 📈 Analytics & Reporting

- Interactive dashboards
- Trend visualization
- PDF report generation
- Project history tracking

---

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express** - REST API server
- **MongoDB** - Database with Mongoose ODM
- **Groq AI** - Lightning-fast code analysis with Llama 3.3 70B
- **Clerk** - Authentication & user management
- **PDFKit** - Report generation

### Frontend

- **React 18** - Modern UI library
- **Vite** - Next-gen build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful charts
- **Clerk React** - Auth components

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- **Clerk** account ([Sign up free](https://clerk.com))
- **Groq API** key ([Get free key](https://console.groq.com/keys))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/CodeReviewAI.git
cd CodeReviewAI
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
GROQ_API_KEY=your_groq_api_key
PORT=5000
NODE_ENV=development
```

Start backend:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start frontend:

```bash
npm run dev
```

### 4. Access the App

Open [http://localhost:5173](http://localhost:5173) in your browser! 🎉

---

## 📖 Configuration Guides

### 🔑 Groq API Setup

See **[GROQ_API_SETUP.md](./GROQ_API_SETUP.md)** for detailed instructions.

**Quick steps:**

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up/login
3. Navigate to [API Keys](https://console.groq.com/keys)
4. Create a new API key
5. Copy and add to `.env` file

**Why Groq?**

- ⚡ 20x faster inference than GPUs
- 🎁 Generous free tier (14,400 requests/day)
- 💳 No credit card required
- 🧠 State-of-the-art Llama 3.3 70B model

### 🗄️ MongoDB Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **free M0 cluster**
3. Add your IP to allowlist
4. Create database user
5. Get connection string
6. Replace `<password>` with your user password

### 🔐 Clerk Setup

1. Sign up at [clerk.com](https://clerk.com)
2. Create new application
3. Copy **Publishable Key** (for frontend)
4. Copy **Secret Key** (for backend)
5. Enable email/password authentication

---

## 📁 Project Structure

```
CodeReviewAI/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── routes.js          # API routes
│   ├── models.js          # MongoDB schemas
│   ├── groq.js            # Groq AI integration
│   ├── auth.js            # Clerk authentication
│   ├── package.json       # Backend dependencies
│   └── .env               # Backend config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main app component
│   │   ├── api.js         # Axios HTTP client
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProjectList.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── AnalysisResults.jsx
│   │   │   ├── SecurityReport.jsx
│   │   │   └── AnalyticsDashboard.jsx
│   │   ├── index.css      # Tailwind styles
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── .env               # Frontend config
│
├── GROQ_API_SETUP.md      # Groq API guide
└── README.md              # This file
```

---

## 🎯 Usage

### 1. Create a Project

- Click **"New Project"** button
- Enter project name and description
- Choose your programming language

### 2. Upload Code

- Paste your code in the editor
- Or upload a file
- Supports: JavaScript, Python, Java, Go, PHP, Ruby, TypeScript, C#

### 3. Run Analysis

- Click **"Analyze Code"**
- Wait for AI processing (usually <5 seconds with Groq!)
- View comprehensive results

### 4. Review Results

- **Security Tab**: Vulnerabilities with OWASP mapping
- **Quality Tab**: Code metrics and smells
- **Performance Tab**: Optimization opportunities
- **Suggestions Tab**: AI-powered improvements

### 5. Export Report

- Click **"Export PDF"** to download detailed report
- Share with your team
- Track improvements over time

---

## 🔥 API Endpoints

### Projects

```
GET    /api/projects              # List all projects
POST   /api/projects              # Create project
GET    /api/projects/:id          # Get project details
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
```

### Analysis

```
POST   /api/analysis              # Analyze code
GET    /api/analysis/:id          # Get analysis results
GET    /api/analysis/project/:id  # Get project analyses
POST   /api/analysis/:id/pdf      # Generate PDF report
```

### Analytics

```
GET    /api/analytics/overview    # Dashboard overview
GET    /api/analytics/trends      # Trend data
```

---

## 🎨 Features in Detail

### Security Analysis

- Detects **OWASP Top 10** vulnerabilities
- Maps to **CWE** (Common Weakness Enumeration)
- Provides **severity ratings**: Critical, High, Medium, Low
- Suggests **code fixes** with before/after examples

### Quality Metrics

- **Complexity**: Cyclomatic complexity score
- **Maintainability**: Index 0-100
- **Duplication**: Percentage of duplicated code
- **Comments**: Comment ratio
- **Technical Debt**: Estimated hours to fix issues

### Performance Analysis

- Identifies **inefficient algorithms**
- Detects **memory leaks**
- Flags **blocking operations**
- Suggests **optimizations**

### AI Suggestions

Uses **Llama 3.3 70B** to generate:

- Refactoring recommendations
- Modern coding patterns
- Security improvements
- Performance optimizations

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** - Lightning-fast AI inference
- **Meta** - Llama 3.3 70B model
- **Clerk** - Authentication made easy
- **MongoDB** - Flexible database
- **Tailwind CSS** - Beautiful styling
- **Framer Motion** - Smooth animations

---

## 📞 Support

- 📧 Email: support@codereview.ai
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/CodeReviewAI/issues)
- 📖 Docs: [Documentation](#)

---

## 🗺️ Roadmap

- [ ] Multi-file analysis
- [ ] GitHub integration
- [ ] GitLab integration
- [ ] VS Code extension
- [ ] Real-time collaboration
- [ ] Custom rule engine
- [ ] More language support
- [ ] Self-hosted deployment

---

**Made with ❤️ by the CodeReview.AI Team**

⭐ Star us on GitHub if you find this useful!
