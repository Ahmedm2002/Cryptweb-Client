import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import menu from "../../../data/menu";
import { Button } from "../commons/Button.jsx";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleOutside = (event) => {
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (open) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("touchstart", handleOutside, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`w-full bg-white/80 backdrop-blur-lg sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? "border-b border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "border-b border-gray-200/50"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            to="/"
            aria-label="Cryptweb home"
            className="text-lg font-bold tracking-tight text-gray-900"
          >
            Cryptweb
          </Link>

          <div
            className="hidden md:flex items-center gap-7"
            role="menubar"
          >
            {menu.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                role="menuitem"
                className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[13px] px-3 py-1.5">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-[13px] px-4 py-1.5">
                Start Sharing
              </Button>
            </Link>
          </div>

          <button
            ref={buttonRef}
            className="md:hidden flex flex-col justify-center items-center gap-1 w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-0.5 w-4 bg-gray-600 transition-all duration-200 ${open ? "rotate-45 translate-y-[3px]" : ""}`}
            />
            <span
              className={`block h-0.5 w-4 bg-gray-600 transition-all duration-200 ${open ? "-rotate-45 -translate-y-[3px]" : ""}`}
            />
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        id="mobile-menu"
        role="menu"
        className={`md:hidden bg-white w-full overflow-hidden transition-all duration-200 border-b border-gray-200 ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-b-0"
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 transition-colors"
            >
              {item.label}
            </Link>
          ))}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
