"use client";

import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const menuLinks = [
    { href: "/play", label: "Play" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-center">
      {/* Top Header */}
      <div className="md:container flex h-14 items-center justify-between px-4 w-full">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">AlkoGuessr</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <ul className="hidden md:flex space-x-4">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hamburger Button */}
        <div className="flex items-center md:hidden z-50">
          <Button
            variant={"outline"}
            onClick={toggleMenu}
            className="p-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none"
          >
            <Menu />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`md:hidden fixed top-14 right-0 min-h-screen  w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-end space-y-4 p-4 transition-transform duration-300 transform border-l-2 border-l ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 40 }}
      >
        {menuLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium transition-colors hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <ModeToggle />
      </nav>
    </header>
  );
}
