"use client";

import { useRouter } from "next/navigation";

import { LogOut, Menu } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useLogoutMutation } from "@/store/api/authApi";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";

const initialsOf = (name?: string) =>
  (name ?? "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "RP";

export function Topbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // The session is cleared regardless; proceed to the login screen.
    }
    router.replace("/dashboard/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="border-b px-5 py-4">
            <BrandMark />
          </div>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex h-auto items-center gap-2 px-2 py-1.5">
            <Avatar>
              <AvatarFallback>{initialsOf(user?.fullname)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user?.fullname ?? "Admin"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.fullname}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isLoading} onSelect={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
