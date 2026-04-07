import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import menu from "../../data/menu";
import { Button } from "../components/Button.jsx";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (open) setOpen(false);
    };

    const handleOutsideInteraction = (event) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("mousedown", handleOutsideInteraction);
      document.addEventListener("touchstart", handleOutsideInteraction, {
        passive: true,
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, [open]);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="w-full border-b border-gray-200 bg-white sticky top-0 z-50 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative bg-white z-20">
            <Link
              to="/"
              tabIndex={0}
              aria-label="Cryptweb home"
              className="text-2xl font-black tracking-tight text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
            >
              CRYPTWEB
            </Link>

            <div
              className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
              role="menubar"
              aria-label="Site navigation links"
            >
              {menu.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  role="menuitem"
                  tabIndex={0}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex">
              <Link to="/signup">
                <Button
                  variant="primary"
                  tabIndex={0}
                  aria-label="Get started with Cryptweb"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            <button
              ref={buttonRef}
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

        {/* Mobile Dropdown Wrapper with Smooth Transitions */}
        <div
          ref={menuRef}
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation"
          className={`lg:hidden bg-white w-full overflow-hidden transition-all duration-300 ease-in-out absolute left-0 ${
            open
              ? "max-h-[400px] border-b border-gray-100 shadow-xl opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-6 pt-2 flex flex-col gap-2">
            {menu.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                role="menuitem"
                tabIndex={0}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-semibold text-gray-700 hover:text-gray-900 border-b border-gray-100 last:border-0 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded px-2"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
