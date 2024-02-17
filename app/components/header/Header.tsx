"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Container,
  Group,
  Burger,
  Menu,
  rem,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./Header.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import auth from "firebase.init";
import { IconUserCircle, IconLogout } from "@tabler/icons-react";
import { deleteAuthCookies } from "app/actions/deleteAuthCookies";
import { setAuthCookies } from "app/actions/setAuthCookies";
import cx from "clsx";

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
            throw new Error("error firebase getIdToken");
          }

          try {
            //todo: too many setAuthCookies calls will happen. Try to minimize.
            //action call to set auth cookies
            await setAuthCookies(idToken);
          } catch (e) {
            console.error("error setting auth cookies", e);
            throw new Error("error setting auth cookies");
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

  //todo: restrict login page to logged in users

  //if logged in, return a ProfileButton based on role, otherwise return Login Button
  function ProfileButton() {
    if (!isLoggedIn) {
      return (
        <Link href={"/giris"} passHref legacyBehavior>
          <a
            className={cx(classes.link, classes.login_link)}
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
              <UnstyledButton
                className={cx(classes.link, classes.login_link)}
                data-active={active === "/panel" || undefined}
              >
                Öğrenci Paneli
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                href="/panel"
                leftSection={
                  <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => {
                  setActive("/panel");
                }}
              >
                Panelim
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconLogout style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={async () => await handleLogout()}
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
              <UnstyledButton
                className={cx(classes.link, classes.login_link)}
                data-active={active === "/admin" || undefined}
              >
                Admin Paneli
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component={Link}
                href="/admin"
                leftSection={
                  <IconUserCircle style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => {
                  setActive("/admin");
                }}
              >
                Panelim
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconLogout style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={async () => await handleLogout()}
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
        <Link href={"/"}>
          <Image
            src="/platon-logo.png"
            height={32}
            width={99}
            alt="Platon Logo"
            className={classes.logo}
          />
        </Link>

        <Group gap={5} visibleFrom="xs">
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

          <Link href={"/hakkimizda"} passHref legacyBehavior>
            <a
              className={classes.link}
              data-active={active === "/hakkimizda" || undefined}
              onClick={() => {
                setActive("/hakkimizda");
              }}
            >
              Hakkımızda
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
