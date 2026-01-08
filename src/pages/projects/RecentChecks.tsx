import type { CheckRun } from "../../shared/types/run";

type RecentChecksProps = {
    runs?: CheckRun[];
};

export function RecentChecks({ runs }: RecentChecksProps) {
    const checks = runs ?? [];
    return (
        <div>
            <table className="recent-checks-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Status</th>
                        <th>LCP</th>
                        <th>CLS</th>
                        <th>INP</th>
                    </tr>
                </thead>
                <tbody>
                        {checks.map((item) => {
                            // Формирование url было относительным (например, aurora-store/history/checkRun2)
                            // Но роут работает как "/projects/:id/history/:historyId"
                            // Значит нужен слэш и полный путь: "/projects/..."
                            const url = `/projects/${item.projectId}/history/${item.id}`;
                            return (
                                <tr key={item.id + item.checkedAt}>
                                    <td>
                                        <a href={url} style={{ textDecoration: "underline", color: "#1a3a8b" }}>
                                            {item.checkedAt}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={`status status--${item.status}`}>{item.status}</span>
                                    </td>
                                    <td>{item.metrics.lcp}</td>
                                    <td>{item.metrics.cls}</td>
                                    <td>{item.metrics.inp}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    )
}