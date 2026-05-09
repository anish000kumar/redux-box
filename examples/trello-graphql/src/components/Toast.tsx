import { connectStore } from 'redux-box';

import { dispatchers as uiDispatchers } from '../store/ui';
import { getToast } from '../store/ui/selectors';

interface Props {
  toast: { kind: 'success' | 'error'; message: string } | null;
  dismissToast: () => unknown;
}

function Toast({ toast, dismissToast }: Props) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast toast--${toast.kind}`}
    >
      <span>{toast.message}</span>
      <button type="button" onClick={dismissToast} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default connectStore({
  mapSelectors: { toast: getToast },
  mapDispatchers: { dismissToast: uiDispatchers.dismissToast },
})(Toast as any);
