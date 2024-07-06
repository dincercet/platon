"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "firebase.init";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";
import { setAuthCookies } from "app/actions/setAuthCookies";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { MoonIcon, SunIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";

import { useTheme } from "next-themes";

//decide which storage is used for auth info
function getStorage() {
  let storage;
  return (storage =
    window.localStorage.getItem("loggedIn") === "true"
      ? window.localStorage
      : window.sessionStorage);
}

//Header component for navigation (used in root layout)
export default function Header() {
  const pathname = usePathname();

  const [active, setActive] = useState(pathname);
  //Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    //window object available only after mount
    const storage = getStorage();

    try {
      //client call to firebase for logged in status
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          //logged in

          setIsLoggedIn(true);

          if (storage.getItem("role") === "user") {
            setRole("user");
          } else if (storage.getItem("role") === "admin") {
            setRole("admin");
          }

          let idToken;
          try {
            //firebase tokens will expire in 1 hour. For that reason we need to get a refreshed token and update the cookies constantly.
            //(force token refresh: true)
            idToken = await currentUser.getIdToken(true);
          } catch (e) {
            console.error("error firebase getIdToken", e);
            return;
          }

          try {
            //todo: too many setAuthCookies calls will happen. Try to minimize.
            //action call to set auth cookies
            await setAuthCookies(idToken);
          } catch (e) {
            console.error("error setting auth cookies", e);
            return;
          }

          //delete later(check useEffect call count)
          console.log("(useEffect onAuthStateChanged executed)");
        } else {
          //logout: if not already logged out, call the logout handler
          if (!storage.getItem("loggedIn")) {
            await handleLogout(storage);
          }
        }
      });
    } catch {
      console.error("error firebase onAuthStateChanged");
    }
  }, [isLoggedIn]);

  //logout handler
  async function handleLogout(storage?: Storage) {
    try {
      //client call to firebase for logout
      await signOut(auth);
    } catch (e) {
      console.error("firebase sign out error", e);
      return;
    }

    try {
      //todo: return accurate error from action
      //delete auth related cookies
      await deleteAuthCookies();
    } catch {
      console.error("couldn't delete cookies");
      return;
    }

    //clear auth info from storage
    if (storage) {
      storage.removeItem("loggedIn");
      storage.removeItem("email");
      storage.removeItem("role");
    }

    setRole("");
    setIsLoggedIn(false);

    console.log("logged out");
  }

  function DarkModeButton({ className }: { className?: string }) {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={className}
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    );
  }

  //todo: restrict login page to logged in users

  //if logged in, return a ProfileButton based on role, otherwise return Login Button
  function ProfileButton() {
    if (!isLoggedIn) {
      return (
        <NavigationMenuItem className="flex list-none justify-self-end">
          <DarkModeButton className="hidden sm:flex mr-1" />
          <Link href="/giris" legacyBehavior passHref>
            <NavigationMenuLink
              active={active === "/giris"}
              onSelect={() => {
                setActive("/giris");
              }}
              className={navigationMenuTriggerStyle()}
            >
              Öğrenci Girişi
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      );
    } else {
      return (
        <NavigationMenuItem className="flex list-none justify-self-end">
          <DarkModeButton className="hidden sm:flex mr-1" />
          <NavigationMenuTrigger>
            {role === "user" ? "Öğrenci Paneli" : "Admin Paneli"}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex flex-col p-2">
              <li>
                <Link
                  href={role === "user" ? "/panel" : "/admin"}
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink
                    active={active === "/panel"}
                    onSelect={() => {
                      setActive("/panel");
                    }}
                    className={navigationMenuTriggerStyle()}
                  >
                    Panelim
                  </NavigationMenuLink>
                </Link>
              </li>
              <li>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onSelect={async () => await handleLogout()}
                >
                  Çıkış Yap
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }
  }

  return (
    <Drawer>
      <header className="container px-2">
        <NavigationMenu>
          <div className="col-span-2 sm:col-span-1 flex gap-1 justify-self-start">
            <DrawerTrigger asChild className="sm:hidden">
              <Button variant="outline" size="icon">
                <HamburgerMenuIcon />
              </Button>
            </DrawerTrigger>

            <DarkModeButton className="flex sm:hidden" />

            <div className="sm:justify-self-start content-center">
              <Link href={"/"} passHref>
                <Image
                  src="/platon-logo.png"
                  height="36"
                  width="110"
                  alt="Platon Logo"
                  className="object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="hidden sm:block justify-self-center">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/egitimler" legacyBehavior passHref>
                  <NavigationMenuLink
                    active={active === "/egitimler"}
                    onSelect={() => {
                      setActive("/egitimler");
                    }}
                    className={navigationMenuTriggerStyle()}
                  >
                    Eğitimler
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/hakkimizda" legacyBehavior passHref>
                  <NavigationMenuLink
                    active={active === "/hakkimizda"}
                    onSelect={() => {
                      setActive("/hakkimizda");
                    }}
                    className={navigationMenuTriggerStyle()}
                  >
                    Hakkımızda
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/iletisim" legacyBehavior passHref>
                  <NavigationMenuLink
                    active={active === "/iletisim"}
                    onSelect={() => {
                      setActive("/iletisim");
                    }}
                    className={navigationMenuTriggerStyle()}
                  >
                    İletişim
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </div>

          <ProfileButton />
        </NavigationMenu>
      </header>
      <DrawerContent>
        <div className="grid grid-cols-2">
          <div className="my-4 ml-4">
            <Image
              src="/platonheykel.jpg"
              width="500"
              height="500"
              alt="heykel"
              className="w-full h-full object-cover rounded-t-xl"
            ></Image>
          </div>

          <div className="flex flex-col gap-4 items-center justify-center my-4">
            <Link href="/egitimler" legacyBehavior passHref>
              <Button variant="ghost" className="w-36">
                Eğitimler
              </Button>
            </Link>

            <Link href="/hakkimizda" legacyBehavior passHref>
              <Button variant="ghost" className="w-36">
                Hakkımızda
              </Button>
            </Link>

            <Link href="/iletisim" legacyBehavior passHref>
              <Button variant="ghost" className="w-36">
                İletişim
              </Button>
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
