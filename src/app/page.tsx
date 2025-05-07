
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Globe, Languages } from 'lucide-react';
import Image from 'next/image';

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-primary/10 dark:bg-primary/20 p-6 text-center">
           <div className="flex justify-center mb-4">
            <Image 
              src="https://picsum.photos/seed/knightlanding/120/120" 
              alt="Knight's Tour Game" 
              width={120} 
              height={120} 
              className="rounded-full border-4 border-primary shadow-lg"
              data-ai-hint="chess knight" 
            />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-2">
            <Globe className="w-8 h-8" />
            Welcome to Knight's Tour!
          </CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground pt-2">
            Embark on a strategic journey across the chessboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 text-center">
          <p className="mb-6 text-lg text-foreground">
            Please select your preferred language to start the game:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg py-7 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-transform bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              <Link href="/en" className="flex items-center justify-center gap-2">
                <Languages className="w-5 h-5" /> English
              </Link>
            </Button>
            <Button asChild size="lg" className="text-lg py-7 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-transform bg-secondary hover:bg-secondary/80 text-secondary-foreground w-full sm:w-auto">
              <Link href="/ko" className="flex items-center justify-center gap-2">
                <Languages className="w-5 h-5" /> 한국어
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 dark:bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Inspired by classic puzzles and strategic board games.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
