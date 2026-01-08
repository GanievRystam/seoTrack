import { Link } from "react-router-dom";

export function ProjectsHeader() {
    return (
      <div className="page__header">
      <div>
        <h1 className="page__title">Projects</h1>
        <p className="page__subtitle">Your SEO and performance watchlist.</p>
      </div>
      <Link to="add" className="button button--ghost">
        Добавить проект
      </Link>
    </div>
    )
}