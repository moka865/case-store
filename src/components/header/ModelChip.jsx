import { useStore } from '../../context/StoreContext';

/**
 * Pill-shaped phone-model chip shown on product listings.
 * Per DESIGN.md: pills are used ONLY for this phone-model chip.
 */
export function ModelChip() {
  const { phoneSelection, selectedModel, setIsModelSelectorOpen } = useStore();

  if (phoneSelection.status === 'pending') {
    return (
      <div className="inline-flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-[var(--gallery-white)] px-5 py-1.5 text-[14px] font-medium text-[var(--charcoal)]">
        <span>موديلك بيتأكد من خدمة العملاء</span>
        <button
          type="button"
          onClick={() => setIsModelSelectorOpen(true)}
          className="btn-secondary !min-h-[32px] !text-[14px] text-[var(--klein)]"
        >
          غيّر
        </button>
      </div>
    );
  }

  if (phoneSelection.status === 'selected' && selectedModel) {
    return (
      <div className="inline-flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-[var(--gallery-white)] px-5 py-1.5 text-[14px] font-medium text-[var(--charcoal)]">
        <span>
          بتشوف جرابات{' '}
          <bdi dir="ltr" className="font-semibold">
            {selectedModel.name}
          </bdi>
        </span>
        <button
          type="button"
          onClick={() => setIsModelSelectorOpen(true)}
          className="btn-secondary !min-h-[32px] !text-[14px] text-[var(--klein)]"
        >
          غيّر
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex min-h-[44px] flex-wrap items-center gap-x-3 gap-y-1 rounded-full bg-[var(--gallery-white)] px-5 py-1.5 text-[14px] font-medium text-[var(--graphite)]">
      <span>بتشوف كل الجرابات</span>
      <button
        type="button"
        onClick={() => setIsModelSelectorOpen(true)}
        className="btn-secondary !min-h-[32px] !text-[14px] text-[var(--klein)]"
      >
        اختار موبايلك
      </button>
    </div>
  );
}
