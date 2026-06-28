import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Plug, Settings as SettingsIcon, TerminalSquare } from "lucide-react";
import { BitbucketSyncButton } from "./bitbucket-sync-button";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border/40 pb-6 mb-8">
        <div className="p-3 bg-accent/10 rounded-xl">
          <SettingsIcon className="w-8 h-8 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground">Preferences</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your profile, configurations, and integrations.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Navigation / TOC */}
        <div className="hidden lg:block space-y-2">
          <Button variant="ghost" className="w-full justify-start text-primary-foreground bg-accent/5 font-medium hover:bg-accent/10">
            <User className="w-4 h-4 mr-2" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-accent/5 hover:text-primary-foreground transition-all">
            <Plug className="w-4 h-4 mr-2" /> Integrations
          </Button>
        </div>

        {/* Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/40 shadow-xl shadow-black/20 bg-card/60 backdrop-blur-xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-accent to-purple-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-accent" /> Profile Information
              </CardTitle>
              <CardDescription>Update your personal details and how you appear on the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary-foreground">Display Name</Label>
                <Input 
                  placeholder="Your Name" 
                  defaultValue="Me" 
                  className="bg-background/80 transition-all focus:ring-accent focus:border-accent border-border/50 py-5 text-md" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-primary-foreground">Primary Role</Label>
                <Input 
                  placeholder="Your Role" 
                  defaultValue="Frontend Developer" 
                  className="bg-background/80 transition-all focus:ring-accent focus:border-accent border-border/50 py-5 text-md" 
                />
              </div>
            </CardContent>
            <CardFooter className="bg-background/40 border-t border-border/30 pt-6">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] font-semibold px-6">
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/40 shadow-xl shadow-black/20 bg-card/60 backdrop-blur-xl overflow-hidden relative group">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-xl flex items-center gap-2">
                <TerminalSquare className="w-5 h-5 text-blue-500" /> Bitbucket Integration
              </CardTitle>
              <CardDescription>System credentials mapped from environment variables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10">
              <div className="bg-background p-5 rounded-xl font-mono text-sm border border-border/40 text-muted-foreground shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-emerald-500 font-bold">Connected</span>
                </div>
                <div className="space-y-1.5 mt-4">
                  <p><span className="text-primary-foreground font-semibold">BITBUCKET_USERNAME</span> <span className="opacity-50">=</span> <span className="text-green-400">***</span></p>
                  <p><span className="text-primary-foreground font-semibold">BITBUCKET_APP_PASSWORD</span> <span className="opacity-50">=</span> <span className="text-green-400">***</span></p>
                  <p><span className="text-primary-foreground font-semibold">BITBUCKET_WORKSPACE</span> <span className="opacity-50">=</span> <span className="text-green-400">***</span></p>
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground flex items-center gap-2 bg-accent/5 p-3 rounded-lg border border-accent/10">
                To update these credentials, securely edit the <code>.env</code> file in your project directory and restart the development server.
              </p>
              
              <BitbucketSyncButton />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
