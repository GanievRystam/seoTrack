import type { CheckRun } from "../../shared/types/run";

type RecentChecksProps = {
    runs?: CheckRun[];
    metricView: "desc" | 'mob'
};

export function RecentChecks({ runs, metricView }: RecentChecksProps) {
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
                            const url = `/projects/${item.projectId}/history/${item.id}`;
                            return (
                                <tr key={item.id + item.finishedAt}>
                                    <td>
                                        <a href={url} style={{ textDecoration: "underline", color: "#1a3a8b" }}>
                                            {item.finishedAt}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={`status status--${item.status?.toLocaleLowerCase()}`}>{item.status}</span>
                                    </td>
                                    <td>{item.metrics[metricView].lcp}</td>
                                    <td>{item.metrics[metricView].cls}</td>
                                    <td>{item.metrics[metricView].inp}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    )
}