export default function Navbar() {
      // const [drawerOpen, setDrawerOpen] = useState(false);
    return (
        <header className="bg-[#212529] px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center space-x-4">
            <a href="/" className="font-bold text-white text-xl">THEDEXBOT.COM</a>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Desktop Menu Dropdown */}
            {/* <div className="hidden md:block">
              <MenuDropdown />
            </div> */}

            {/* Sign In (Desktop Only) */}
            {/* <a
              href="https://securearbitrage.com/sign-in"
              className="hidden md:inline-block"
            >
              <Button
                style={{
                  background: "linear-gradient(45deg, #5B86E5, #36D1DC)",
                  color: "#FFFFFF",
                  padding: "8px",
                  fontSize: "16px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "0.3s ease",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                Sign In
              </Button>
            </a> */}

            {/* Hamburger Menu (Mobile Only) */}
            {/* <button
              className="text-white text-2xl md:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              ☰
            </button> */}
          </div>
        </div>

        {/* Drawer (Mobile Only) */}
        {/* <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} /> */}
      </header>
    );
}