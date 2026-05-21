import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ backgroundImage: 'url(/images/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      <header className="px-6 py-8 flex justify-between items-center relative z-10">
        <h1 className="text-3xl font-black tracking-tighter">VOID</h1>
        <div className="space-x-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-white hover:text-white/80 uppercase tracking-widest text-xs font-bold">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-white text-black hover:bg-white/90 rounded-none uppercase tracking-widest text-xs font-bold">Create Profile</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 -mt-20">
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase">
          Your Art. <br/> No Noise.
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 font-mono">
          A brutalist, high-contrast link-in-bio platform for the underground. 
          Curate your links, showcase your photos, own your aesthetic.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-none h-16 px-12 text-lg uppercase tracking-widest font-bold">
            Claim Your Void
          </Button>
        </Link>
      </main>
    </div>
  );
}
