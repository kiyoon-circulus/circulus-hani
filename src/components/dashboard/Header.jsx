import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";

export function Header() {
  const { getName, logout } = useAuth();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 bg-white border-b border-border">
      <div className="flex items-center gap-4">
        <a className="flex items-center gap-2 cursor-pointer" href="/">
          <div className="flex items-center justify-center rounded-lg">
            <img src="/180.png" alt="또박 한글" className="w-12 h-12" />
          </div>
          <h1 className="text-xl font-bold">학습 관리 시스템</h1>
        </a>
      </div>

      <div className="flex items-center gap-4">
        {/* <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button> */}
        <span className="text-sm cursor-default">{getName() || "guest"}</span>
        <Button variant="ghost" size="icon" onClick={logout}>
          <Avatar className="w-8 h-8">
            <AvatarImage src="" />
            <AvatarFallback>
              <LogOut className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}
