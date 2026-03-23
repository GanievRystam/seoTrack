type ProjectDetailsMetricSwitchProps = {
    metricView: "desc" | 'mob';
    onChange: (view: "desc" | "mob") => void;
}
export function ProjectDetailsMetricSwitch({metricView, onChange}:ProjectDetailsMetricSwitchProps) {
    return (
        <div className="switch-type-data">
            <button
                className="button button--secondary"
                type="button"
                aria-pressed={metricView === "desc"}
                onClick={() => onChange("desc")}
            >
                Десктоп
            </button>
            <button
                className="button button--secondary"
                type="button"
                aria-pressed={metricView === "mob"}
                onClick={() => onChange("mob")}
            >
                Мобайл
            </button>
        </div>
    )
}