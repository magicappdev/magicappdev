import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              MagicAppDev
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Build apps faster with AI-powered development tools. Create, customize, and deploy
            web and mobile applications in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
            >
              Start Building
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Documentation
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="AI-Powered Generation"
            description="Describe your app idea in natural language and let AI generate the code for you."
            icon="🤖"
          />
          <FeatureCard
            title="Cross-Platform"
            description="Build for web and mobile from a single codebase using React and React Native."
            icon="📱"
          />
          <FeatureCard
            title="Deploy Anywhere"
            description="One-click deployment to Cloudflare, Vercel, or your own infrastructure."
            icon="🚀"
          />
        </div>
      </div>

      {/* CLI Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-slate-800/50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get started with the CLI
          </h2>
          <p className="text-slate-300 mb-6">
            Create your first app in seconds with our command-line tool.
          </p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
            <code className="text-green-400">$</code>
            <code className="text-white"> npx create-magicappdev-app my-app</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-slate-400">
        <p>© 2024 MagicAppDev. Open source and free to use.</p>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 hover:bg-slate-800 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
