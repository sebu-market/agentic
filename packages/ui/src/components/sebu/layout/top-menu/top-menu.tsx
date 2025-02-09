"use client"
import { cn } from "@/lib/utils"
import { Link } from '@tanstack/react-router'
import * as React from "react"
// import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { useNavigate } from "@tanstack/react-router"
import { ConnectButton } from "./connect-button"
import { useIsGuardian } from "@/queries/guardian"


const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export function TopMenu() {
  const navigate = useNavigate();
  const isGuardianQuery = useIsGuardian();
  const isGuardian = isGuardianQuery.data?.content === 'true';

  return (
    <div className="flex items-baseline justify-start">
      <div className="mx-4">
        <h1 className="text-3xl font-bold logo">
          <Link to="/">
            sebu
          </Link>
        </h1>
      </div>
      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to="/rounds">
                Pitch Competition
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {(isGuardian) && (
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                <Link to="/guardian">
                  Guardian
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )}

          {/* <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to="/portfolio">
                Portfolio
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem> */}


          {/* <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
              <Link to="/docs">
                Documentation
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem> */}

        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center ml-auto space-x-4">
        <ConnectButton />
      </div>
    </div>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
