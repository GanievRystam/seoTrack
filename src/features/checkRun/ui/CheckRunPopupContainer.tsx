import { CheckRunPopup } from "../../../shared/ui/checkRunPopup/CheckRunPopup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { close } from "../model/checkRunSlice";

export function CheckRunPopupContainer() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.checkRun);

  return (
    <CheckRunPopup
      open={state.open}
      status={state.status}
      title={state.title}
      subtitle={state.subtitle}
      message={state.message}
      onClose={() => dispatch(close())}
    />
  );
}
