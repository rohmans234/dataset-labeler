import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Album } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className='flex justify-center items-center gap-2 mb-4'>
                <Album className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl font-headline">LabelFlow</CardTitle>
            </div>
          <CardDescription>
            Enter your credentials to access the labeling dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="zaid"
                required
                defaultValue="zaid"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
             <p className="text-center text-sm text-muted-foreground">
              Login as admin?{' '}
              <Link href="/admin" className="underline">
                Click here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
