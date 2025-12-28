import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Album } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-background">
      <div className="text-center space-y-8">
        <div className="flex justify-center items-center gap-4">
          <Album className="h-16 w-16 text-primary" />
          <h1 className="text-6xl font-bold font-headline">LabelFlow</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your audio labeling workflow. Efficient, collaborative, and integrated with your favorite tools.
        </p>
        <div>
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
