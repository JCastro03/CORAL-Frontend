
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path ? "bg-primary text-primary-foreground" : "hover:bg-gray-100";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">CORAL</div>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>
              <Avatar>
                <AvatarImage src="" alt="@shadcn" />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Profile
              </MenubarItem>
              <MenubarItem>
                Settings
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>
                Log out
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
      <div className="flex justify-center mt-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-full shadow-lg p-2">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <NavigationMenuLink className={`px-4 py-2 rounded-full font-bold ${getLinkClass('/dashboard')}`}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/calendar">
                    <NavigationMenuLink className={`px-4 py-2 rounded-full font-bold ${getLinkClass('/calendar')}`}>
                      Calendar View
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/assistants">
                    <NavigationMenuLink className={`px-4 py-2 rounded-full font-bold ${getLinkClass('/assistants')}`}>
                      Research Assistants
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/shifts">
                    <NavigationMenuLink className={`px-4 py-2 rounded-full font-bold ${getLinkClass('/shifts')}`}>
                      Study Shifts
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
