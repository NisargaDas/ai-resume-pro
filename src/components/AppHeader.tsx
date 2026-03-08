import { Search, Bell, Sun, Moon, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resumes, templates..." className="pl-9 w-64 h-9 bg-muted border-0" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "system" ? <Monitor className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}><Sun className="mr-2 h-4 w-4" /> Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}><Moon className="mr-2 h-4 w-4" /> Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}><Monitor className="mr-2 h-4 w-4" /> System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
