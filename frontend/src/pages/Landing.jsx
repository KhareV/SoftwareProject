import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  TrendingUp,
  Code2,
  CheckCircle,
  ArrowRight,
  Github,
  Star,
  Users,
} from "lucide-react";
import { Button, Card } from "../components/Shared";

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "Vulnerability Detection",
      description:
        "AI-powered detection of OWASP Top 10 security vulnerabilities with precise line-by-line analysis.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "AI Suggestions",
      description:
        "Get intelligent code improvement suggestions with automated fixes for security issues.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: TrendingUp,
      title: "Time Savings",
      description:
        "Save 70% of code review time with automated analysis and actionable insights.",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  const stats = [
    { value: "70%", label: "Time Saved" },
    { value: "85%", label: "Defects Detected" },
    { value: "30+", label: "Languages" },
    { value: "10K+", label: "Analyses" },
  ];

  const codeExample = `function processPayment(userId, amount) {
  // ⚠️ SQL Injection vulnerability detected
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.execute(query);
  
  // ✅ AI Suggestion: Use parameterized queries
  const safeQuery = "SELECT * FROM users WHERE id = ?";
  db.execute(safeQuery, [userId]);
}`;

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 grid-pattern opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full glass">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-light-200">
                    Powered by Google Gemini AI
                  </span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-7xl font-bold mb-6">
                <span className="gradient-text">AI-Powered</span>
                <br />
                Code Review
              </h1>

              <p className="text-xl sm:text-2xl text-light-200 max-w-3xl mx-auto mb-10">
                Detect vulnerabilities, analyze quality, and get AI-generated
                improvement suggestions in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/analyze">
                  <Button size="lg" icon={Code2}>
                    Start Analyzing
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="secondary" size="lg" icon={Github}>
                  View on GitHub
                </Button>
              </div>
            </motion.div>

            {/* Code Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 max-w-4xl mx-auto"
            >
              <div className="glass rounded-2xl p-8 text-left">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-light-200 ml-4">
                    payment.js
                  </span>
                </div>
                <pre className="text-sm sm:text-base font-mono text-light-100 overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-light-200/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-light-200 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-light-200 max-w-2xl mx-auto">
              Everything you need for comprehensive code analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card hover className="h-full">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-light-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-light-200">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-dark-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">How It Works</span>
            </h2>
            <p className="text-xl text-light-200 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Code",
                description: "Paste your code or upload a file",
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our AI analyzes security, quality & performance",
              },
              {
                step: "3",
                title: "Get Results",
                description: "Receive detailed insights and suggestions",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-light-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-light-200">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="gradient-bg p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to improve your code?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of developers using AI-powered code review to
                build more secure applications.
              </p>
              <Link to="/analyze">
                <Button variant="secondary" size="lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
