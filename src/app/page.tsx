import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F1EFE8] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">
          Jaxtina Process Library
        </span>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign in
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Your company processes,
            <span className="text-primary block sm:inline">
              {" "}at your fingertips
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Browse, search, and consult every internal process with interactive
            flowcharts — built for Jaxtina English Centre.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href="/login">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full text-left">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="text-primary text-xl mb-2 font-bold">01</div>
            <h3 className="font-semibold mb-1">Interactive flowcharts</h3>
            <p className="text-sm text-muted-foreground">
              Visual process maps with decision branches, step-by-step
              navigation, and attached forms.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="text-primary text-xl mb-2 font-bold">02</div>
            <h3 className="font-semibold mb-1">Role-based access</h3>
            <p className="text-sm text-muted-foreground">
              Staff browse read-only. Owners and admins maintain processes and
              manage the library.
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
            <div className="text-primary text-xl mb-2 font-bold">03</div>
            <h3 className="font-semibold mb-1">Magic-link auth</h3>
            <p className="text-sm text-muted-foreground">
              Passwordless sign-in with a single click — secure and simple for
              the whole team.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        Jaxtina English Centre &middot; Internal tool
      </footer>
    </div>
  );
}
