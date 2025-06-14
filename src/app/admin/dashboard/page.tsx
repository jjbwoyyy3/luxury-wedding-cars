import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, Contact, Settings, Eye } from "lucide-react";

export const metadata = {
  title: 'Admin Dashboard - Glitzy Rides',
};

const QuickLinkCard = ({ title, description, href, icon: Icon }: { title: string, description: string, href: string, icon: React.ElementType }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-headline font-medium text-primary">{title}</CardTitle>
      <Icon className="h-6 w-6 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
        <Link href={href}>Go to {title}</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Welcome, Admin!</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            Manage your Glitzy Rides fleet and customer interactions from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your central hub for overseeing operations. Use the links below or the sidebar to navigate.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickLinkCard 
          title="Manage Cars" 
          description="Add, edit, or remove vehicles from your luxury fleet." 
          href="/admin/dashboard/cars"
          icon={Car}
        />
        <QuickLinkCard 
          title="Manage Contact Info" 
          description="Update your company's contact details displayed on the site." 
          href="/admin/dashboard/contact"
          icon={Contact}
        />
         <QuickLinkCard 
          title="View Website" 
          description="See the public website as your customers do." 
          href="/"
          icon={Eye}
        />
        {/* Example for future expansion
        <QuickLinkCard 
          title="Site Settings" 
          description="Configure general website settings and preferences." 
          href="/admin/dashboard/settings"
          icon={Settings}
        /> */}
      </div>
    </div>
  );
}
