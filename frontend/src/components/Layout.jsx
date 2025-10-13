import React from "react";
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Code2,
  BarChart3,
  Shield,
  Zap,
  Github,
  Trophy,
  GitBranch,
} from "lucide-react";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Analyze Code", href: "/analyze", icon: Code2 },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Practice", href: "/practice", icon: Trophy },
    { name: "GitHub", href: "/github", icon: GitBranch },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-100 relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-card border-b border-primary/10 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-dark-300 transition-colors lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl shadow-glow group-hover:shadow-glow-lg transition-all duration-300 group-hover:scale-110">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">
                  CodeReview.AI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-300
                    ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-primary-600 to-secondary-500 text-white shadow-glow"
                        : "text-light-200 hover:text-light-100 hover:bg-dark-300/50 hover:shadow-md"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center px-3 py-2 rounded-lg text-light-200 hover:text-light-100 hover:bg-dark-300 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar (Mobile) */}
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="fixed top-16 left-0 bottom-0 w-64 glass border-r border-light-200/10 z-30 lg:hidden overflow-y-auto"
        >
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-light-200 hover:text-light-100 hover:bg-dark-300"
                  }
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light-200/10">
            <div className="flex items-center space-x-2 text-sm text-light-200">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Powered by Groq AI</span>
            </div>
          </div>
        </motion.aside>
      )}

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-primary/10 mt-auto backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-1.5 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-light-300 text-sm">
                © 2024 CodeReview.AI. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-light-300">
              <a
                href="#"
                className="hover:text-primary-400 transition-all hover:underline underline-offset-4"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-primary-400 transition-all hover:underline underline-offset-4"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-primary-400 transition-all hover:underline underline-offset-4"
              >
                Docs
              </a>
              <a
                href="#"
                className="hover:text-primary-400 transition-all hover:underline underline-offset-4"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
