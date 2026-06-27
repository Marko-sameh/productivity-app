import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your app preferences and connections.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Name</Label>
              <Input placeholder="Your Name" defaultValue="Me" className="bg-background/50 transition-colors focus-visible:bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <Input placeholder="Your Role" defaultValue="Frontend Developer" className="bg-background/50 transition-colors focus-visible:bg-background" />
            </div>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-medium">Save Profile</Button>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-lg shadow-black/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Bitbucket Integration</CardTitle>
            <CardDescription>Configuration is managed via environment variables.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-background/50 p-4 rounded-lg font-mono text-sm border border-border/40 text-muted-foreground">
              <p><span className="text-primary-foreground">BITBUCKET_USERNAME</span>=***</p>
              <p><span className="text-primary-foreground">BITBUCKET_APP_PASSWORD</span>=***</p>
              <p><span className="text-primary-foreground">BITBUCKET_WORKSPACE</span>=***</p>
            </div>
            <p className="text-sm text-muted-foreground">
              To update these credentials, edit the <code>.env</code> file in your project directory and restart the server.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
