"use client";
import { useState, useEffect } from "react";
import { Container, Group, Burger, Menu, rem, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Header.module.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "firebase.init";
import { IconUserCircle, IconLogout } from "@tabler/icons-react";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";

//decide which storage is used for auth info
function getStorage() {
  var storage;
  if (window.localStorage.getItem("loggedIn") === "true") {
    storage = window.localStorage;
  } else {
    storage = window.sessionStorage;
  }
  return storage;
}

//Header component for navigation (used in root layout)
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  //Component states
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(pathname);
  //Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    //window object available only after mount
    const storage = getStorage();

    try {
      //client call to firebase for logged in status
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          //logged in
          console.log("user: (Header)", currentUser.email);

          setIsLoggedIn(true);

          //todo: check if setRole not enough here
          if (storage.getItem("role") === "user") {
            setRole("user");
          } else if (storage.getItem("role") === "admin") {
            setRole("admin");
          }
        } else {
          //logged out
          console.log("logged out");

          try {
            //delete auth related cookies
            await deleteAuthCookies();
          } catch {
            console.log("couldn't delete cookies");
          }

          //clear auth info from storage
          storage.removeItem("loggedIn");
          storage.removeItem("email");
          storage.removeItem("role");

          setRole("");
          setIsLoggedIn(false);
        }
      });
    } catch {
      console.log("error firebase onAuthStateChanged");
    }
  }, [isLoggedIn, role]);

  //logout via Logout Button (will trigger useEffect as well)
  async function handleLogout() {
    try {
      //client call to firebase for logout
      await signOut(auth);
    } catch {
      console.log("firebase sign out error");
      return;
    }

    setRole("");
    setIsLoggedIn(false);
  }

  //todo: restrict login page to logged in users
  //todo: fix missing render of ProfileButton on login

  //if logged in, return a ProfileButton based on role, otherwise return Login Button
  function ProfileButton() {
    console.log("ProfileButton role: ", role);

    if (!isLoggedIn) {
      return (
        <Link href={"/giris"} passHref legacyBehavior>
          <a
            className={`${classes.link} ${classes.login_link}`}
            data-active={active === "/giris" || undefined}
            onClick={() => {
              setActive("/giris");
            }}
          >
            Öğrenci Girişi
          </a>
        </Link>
      );
    } else {
      if (role === "user") {
        return (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button className={`${classes.link} ${classes.login_link}`}>
                Öğrenci Paneli
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => router.push("/panel")}
              >
                Panelim
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconLogout style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={handleLogout}
              >
                Çıkış Yap
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        );
      } else if (role === "admin") {
        return (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button className={`${classes.link} ${classes.login_link}`}>
                Admin Paneli
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => router.push("/admin")}
              >
                Panelim
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconLogout style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={handleLogout}
              >
                Çıkış Yap
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        );
      }
    }
  }

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <MantineLogo size={28} />

        <Group gap={5} visibleFrom="xs">
          <Link href={"/"} passHref legacyBehavior>
            <a
              className={classes.link}
              data-active={active === "/" || undefined}
              onClick={() => {
                setActive("/");
              }}
            >
              Ana Sayfa
            </a>
          </Link>
          <Link href={"/egitimler"} passHref legacyBehavior>
            <a
              className={classes.link}
              data-active={active === "/egitimler" || undefined}
              onClick={() => {
                setActive("/egitimler");
              }}
            >
              Eğitimler
            </a>
          </Link>
          <Link href={"/iletisim"} passHref legacyBehavior>
            <a
              className={classes.link}
              data-active={active === "/iletisim" || undefined}
              onClick={() => {
                setActive("/iletisim");
              }}
            >
              İletişim
            </a>
          </Link>
        </Group>

        <ProfileButton />
        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
