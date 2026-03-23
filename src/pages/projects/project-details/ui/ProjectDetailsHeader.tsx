
import settingIcon from "../../../../assets/settings.png";
type ProjectDetailsHeaderProps = {
    title: string;
    subtitle: string;
    isStarting: boolean;
    isPending: boolean;
    hasStartError: boolean;
    onOpenSettings: () => void;
    onStartCheck: () => void;
};
export function ProjectDetailsHeader({ title, subtitle, isStarting, isPending, hasStartError, onOpenSettings, onStartCheck }: ProjectDetailsHeaderProps) {
    return (
        <div className="page__header">
            <div>
                <div className="panel-mainText-flex">
                    <h1 className="page__title">{title}</h1>
                    <button
                        type="button"
                        className="panel-mainText__btn"
                        aria-label="Открыть настройки проекта"
                        onClick={() => onOpenSettings}
                    >
                        <img
                            src={settingIcon}
                            alt="Настройки проекта"
                            className="panel-mainText__img"
                        />
                    </button>
                </div>
                <p className="page__subtitle">{subtitle}</p>
            </div>
            <button
                className="button button--primary"
                type="button"
                disabled={isStarting || isPending}
                onClick={onStartCheck}
            >
                {isStarting
                    ? "Запускаем..."
                    : isPending
                        ? "Ожидайте"
                        : hasStartError
                            ? "Произошла ошибка"
                            : "Запустить проверку"}
            </button>
        </div>
    )
}