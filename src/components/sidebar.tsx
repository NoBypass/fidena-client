"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Tag,
  Store,
  Settings,
  ChevronsUpDown,
  LogOut, MessagesSquare, ShieldPlus, Sparkles, ArrowRightLeft
} from "lucide-react"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useEffect, useState} from "react";
import {users} from "@/lib/db/schema";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {redirect, usePathname} from "next/navigation";

export function Sidebar() {
  const [user, setUser] = useState<typeof users.$inferSelect>()
  const pathname = usePathname()

  const navigation = [
    [
      { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
      { name: "Accounts", icon: Building2, id: "accounts" },
      { name: "Merchants", icon: Store, id: "merchants" },
      { name: "Labels", icon: Tag, id: "labels" },
      { name: "Transactions", icon: ArrowRightLeft, id: "transactions" },
    ],
    [
      { name: "Updates", icon: Sparkles, id: "updates" },
    ]
  ]

  useEffect(() => {
    fetch("/api/user", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error)
  }, [])

  function emailToName(email: string|undefined|null) {
    if (!email) return ""
    return email.split("@")[0].replace(".", " ")
  }

  function emailToInitials(email: string|undefined|null) {
    if (!email) return ""
    return email.split("@")[0].split(".").map(s => s[0]).join("")
  }

  return (
    <aside className="w-64 border-r bg-card grid grid-rows-[auto_1fr_1fr_auto]">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <ShieldPlus className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Fidena</h2>
            <p className="text-xs text-muted-foreground">Personal Banking</p>
          </div>
        </div>
      </div>

      {navigation.map((section, index) => (
        <nav className={`flex-1 p-2 space-y-1 w-full ${index !== 0 ? "place-self-end justify-self-start" : ""}`} key={index}>
          {section.map((item) => {
            const Icon = item.icon
            const path = `/home/${item.id}`
            return (
              <Button
                asChild
                key={item.id}
                className={cn(
                  "bg-transparent w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  path === pathname
                    ? "bg-muted text-primary hover:bg-muted"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Link href={path} passHref>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      ))}

      <div className="p-2">
        <Popover>
          <PopoverTrigger className="p-2 grid grid-cols-[auto_1fr_auto] gap-1 items-center text-left w-full hover:bg-muted/50 rounded-lg transition-colors duration-75">
            <Avatar className="whitespace-nowrap rounded-lg size-9">
              <AvatarImage
                src=""
                alt=""
              />
              <AvatarFallback className="rounded-none">{emailToInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="ml-2 text-sm font-medium text-foreground capitalize">{emailToName(user?.email)}</p>
              <p className="ml-2 text-sm font-medium text-muted-foreground">{user?.email || ""}</p>
            </div>
            <ChevronsUpDown className="whitespace-nowrap size-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="p-2">
            <button className="flex items-center gap-2 hover:bg-muted/50 w-full p-2 rounded-lg"><MessagesSquare className="size-4" /> Help & Support</button>
            <button className="flex items-center gap-2 hover:bg-muted/50 w-full p-2 rounded-lg"><Settings className="size-4" /> Settings</button>
            <Separator className="my-2" />
            <button className="text-destructive flex items-center gap-2 hover:bg-muted/50 w-full p-2 rounded-lg"
                    onClick={() => {
                      fetch("/api/auth/logout", { method: "GET", credentials: "include" })
                      redirect("/auth/register")
                    }}>
              <LogOut className="size-4" /> Log Out
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
