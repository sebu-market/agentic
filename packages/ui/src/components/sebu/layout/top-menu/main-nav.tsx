import { cn } from "@/lib/utils"


const MainNavLink : React.FC<React.HTMLProps<HTMLAnchorElement>> = ({ children, ...props }) => {
  // TODO: replace w. router logic
  const isActive = props.href === window.location.pathname

  return (
    <a
      {...props}
      className={cn(
        "text-sm font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground",
        props.className
      )}
    >
      {children}
    </a>
  )
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <MainNavLink href="/">Home</MainNavLink>
    </nav>
  )
}