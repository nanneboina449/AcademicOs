import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold text-primary">AcademicOS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-primary sm:text-6xl">
            Institutional Intelligence Platform
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Empowering UK/EU universities with data-driven insights to address research
            administration burden, financial sustainability, student retention, and AI governance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '📊',
              title: 'Research Admin Analytics',
              description: 'Track time allocation, identify bottlenecks, and reduce the 42% admin burden',
            },
            {
              icon: '💰',
              title: 'Financial Sustainability',
              description: 'Deficit forecasting, scenario modeling, and revenue diversification insights',
            },
            {
              icon: '🎓',
              title: 'Student Retention',
              description: 'ML-powered risk prediction for dropout and mental health intervention',
            },
            {
              icon: '🤖',
              title: 'AI Governance',
              description: 'Policy frameworks, assessment redesign, and staff readiness tools',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 rounded-2xl bg-primary/5 p-12 text-center">
          <h2 className="text-3xl font-bold">Key Statistics</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="text-4xl font-bold text-primary">42%</div>
              <div className="mt-2 text-muted-foreground">
                Researcher time lost to admin
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">£6.2B</div>
              <div className="mt-2 text-muted-foreground">
                Annual funding shortfall
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">450%</div>
              <div className="mt-2 text-muted-foreground">
                Increase in mental health disclosures
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-24 border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 AcademicOS. Institutional Intelligence Platform for UK/EU Universities.</p>
        </div>
      </footer>
    </div>
  );
}
