import { Outlet} from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";

import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="app">


      <main className="main">
        <Sidebar />
        <div className="main__content">
          <div className="container">
            <Outlet />
          </div>
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
