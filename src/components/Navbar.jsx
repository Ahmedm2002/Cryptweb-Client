import { useState } from "react";
import menu from "../../data/menu";
import { Button } from "../components/Button.jsx";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="w-full border-b border-gray-200 bg-white sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a
              href="#"
              tabIndex={0}
              aria-label="Cryptweb home"
              className="text-xl font-bold tracking-widest text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
            >
              Cryptweb
            </a>

            <div
              className="hidden lg:flex items-center gap-8"
              role="menubar"
              aria-label="Site navigation links"
            >
              {menu.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  tabIndex={0}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  aria-label={
                    item.external
                      ? `${item.label} (opens in new tab)`
                      : item.label
                  }
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex">
              <Button
                variant="primary"
                tabIndex={0}
                aria-label="Get started with Cryptweb"
              >
                Get Started
              </Button>
            </div>

            <button
              className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={
                open ? "Close navigation menu" : "Open navigation menu"
              }
              tabIndex={0}
            >
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition-transform duration-300 ${open ? "rotate-45 translate-y-2" : ""}`}
                aria-hidden="true"
              />
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
                aria-hidden="true"
              />
              <span
                className={`block h-0.5 w-5 bg-gray-800 transition-transform duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {open && (
          <div
            id="mobile-menu"
            role="menu"
            aria-label="Mobile navigation"
            className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 flex flex-col gap-1"
          >
            {menu.map((item) => (
              <a
                key={item.label}
                href={item.href}
                role="menuitem"
                tabIndex={0}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                aria-label={
                  item.external
                    ? `${item.label} (opens in new tab)`
                    : item.label
                }
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-gray-700 hover:text-gray-900 border-b border-gray-100 last:border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-3">
              <Button
                variant="primary"
                className="w-full justify-center"
                tabIndex={0}
                aria-label="Get started with Cryptweb"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
