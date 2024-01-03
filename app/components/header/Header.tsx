"use client";
import { useState, useEffect } from "react";
import { Container, Group, Burger, Menu, rem, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Header.module.css";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "firebase.init";
import { IconUserCircle, IconLogout } from "@tabler/icons-react";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";

export default function Header() {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(pathname);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          setIsLoggedIn(true);
          if (
            window.localStorage.getItem("role") === "user" ||
            window.sessionStorage.getItem("role") === "user"
          ) {
            setRole("user");
          } else if (
            window.localStorage.getItem("role") === "admin" ||
            window.sessionStorage.getItem("role") === "admin"
          ) {
            setRole("admin");
          }
        } else {
          try {
            await deleteAuthCookies();
          } catch {
            console.log("couldn't delete cookies");
          }

          window.localStorage.clear();
          window.sessionStorage.clear();

          setRole("");
          setIsLoggedIn(false);
        }
      });
    } catch {
      console.log("error firebase onAuthStateChanged");
    }
  }, [isLoggedIn]);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      console.log("firebase sign out error");
      return;
    }

    try {
      await deleteAuthCookies();
    } catch {
      console.log("couldn't delete cookies");
    }

    window.localStorage.clear();
    window.sessionStorage.clear();

    setRole("");
    setIsLoggedIn(false);
  }

  //todo: restrict login page to logged in users
  function ProfileButton() {
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
    } else if (role === "user") {
      return (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button
              className={`${classes.link} ${classes.login_link}`}
              data-active={active === "/giris" || undefined}
              onClick={() => {
                setActive("/giris");
              }}
            >
              Öğrenci Paneli
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => redirect("/panel")}
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
            <Button
              className={`${classes.link} ${classes.login_link}`}
              data-active={active === "/giris" || undefined}
              onClick={() => {
                setActive("/giris");
              }}
            >
              Admin Paneli
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={
                <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => redirect("/admin")}
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
