import { useStore } from '../../context/StoreContext';
import { PhoneHardwareIcon } from '../icons/Icons';

/**
 * Pill-shaped phone-model chip shown on product listings.
 */
export function ModelChip() {
  const { phoneSelection, selectedModel, setIsModelSelectorOpen } = useStore();

  if (phoneSelection.status === 'pending') {
    return (
      <div className="inline-flex min-h-[40px] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-[var(--border-strong)] bg-[var(--brand-yellow-tint)] px-4 py-1 text-[13.5px] font-semibold text-[var(--ink)]">
        <PhoneHardwareIcon className="h-4 w-4 text-[var(--ink)]" />
        <span>موديلك بيتأكد من خدمة العملاء</span>
        <button
          type="button"
          onClick={() => setIsModelSelectorOpen(true)}
          className="font-bold text-[var(--brand)] underline underline-offset-4 cursor-pointer"
        >
          غيّر
        </button>
      </div>
    );
  }

  if (phoneSelection.status === 'selected' && selectedModel) {
    return (
      <div className="inline-flex min-h-[40px] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-1 text-[13.5px] font-medium text-[var(--ink)]">
        <span className="h-2 w-2 rounded-full bg-[var(--jade)]" aria-hidden="true" />
        <span>
          بتشوف جرابات{' '}
          <bdi dir="ltr" className="latin-title font-bold text-[var(--ink)]">
            {selectedModel.name}
          </bdi>
        </span>
        <button
          type="button"
          onClick={() => setIsModelSelectorOpen(true)}
          className="font-bold text-[var(--brand)] underline underline-offset-4 cursor-pointer"
        >
          غيّر
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex min-h-[40px] flex-wrap items-center gap-x-2.5 gap-y-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-1 text-[13.5px] font-medium text-[var(--ink-muted)]">
      <PhoneHardwareIcon className="h-4 w-4 text-[var(--ink-muted)]" />
      <span>بتشوف كل الجرابات</span>
      <button
        type="button"
        onClick={() => setIsModelSelectorOpen(true)}
        className="font-bold text-[var(--brand)] underline underline-offset-4 cursor-pointer"
      >
        اختار موبايلك
      </button>
    </div>
  );
}
