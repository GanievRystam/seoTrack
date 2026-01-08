import { Outlet, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getSessionUser, logout } from "../shared/storage/authStore";

import "./AppLayout.css";

export function AppLayout() {
  const user = getSessionUser();
  const navigate = useNavigate();
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <div className="brand__logo">PM</div>
            <div className="brand__text">
              <div className="brand__name">Perf Monitor</div>
              <div className="brand__tag">E-commerce performance alerts</div>
            </div>
          </div>

          <nav className="nav">
            <NavLink to="/projects" className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}>
              Projects
            </NavLink>
            {user ? (
              <button
              className="nav__link"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="nav__link">
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span>© {new Date().getFullYear()} Perf Monitor</span>
          <span className="footer__sep">·</span>
          <span>Status: MVP</span>
        </div>
      </footer>
    </div>
  );
}
