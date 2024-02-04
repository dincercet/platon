"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tooltip, UnstyledButton, Stack, rem } from "@mantine/core";
import {
  IconHome2, //Home
  IconBooks, //Courses
  IconCalendarTime, //Curriculum
  IconSchoolBell, //Schedules
  IconSchool, //Students
  // IconFileUpload, //File upload (if needed)
} from "@tabler/icons-react";
import classes from "./Navbar.module.css";

interface NavbarLinkProps {
  icon: typeof IconHome2;
  label: string;
  path: string;
  active: string;
  onClick(): void;
}

function NavbarLink({
  icon: Icon,
  label,
  path,
  active,
  onClick,
}: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton
        component={Link}
        href={path}
        onClick={onClick}
        className={classes.link}
        data-active={active === path || undefined}
      >
        <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const navbarLinks = [
  { icon: IconHome2, label: "Ana Sayfa", path: "/admin" },
  { icon: IconBooks, label: "Dersler", path: "/admin/dersler" },
  { icon: IconCalendarTime, label: "Müfredatlar", path: "/admin/mufredatlar" },
  { icon: IconSchoolBell, label: "Tarihler", path: "/admin/tarihler" },
  { icon: IconSchool, label: "Öğrenciler", path: "/admin/ogrenciler" },
];

export function Navbar() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);

  const links = navbarLinks.map((link) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={active}
      onClick={() => {
        setActive(link.path);
      }}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Stack justify="center" gap={rem(3)} mt={rem(3)}>
        {links}
      </Stack>
    </nav>
  );
}
