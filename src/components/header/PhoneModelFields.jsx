import { useId, useMemo, useRef, useState } from 'react';
import { EGYPT_MOBILE_REGEX } from '../../contracts/handoffSchema';
import { useStore } from '../../context/StoreContext';
import { BackArrowRtlIcon, CheckIcon, PhoneHardwareIcon } from '../icons/Icons';

/**
 * Derives an initial per-item phone selection state from either an existing cart item's
 * `printSpec` or the site-wide default `phoneSelection`.
 */
export function createItemPhoneState(source, allPhoneModels = []) {
  if (!source) {
    return {
      status: 'none',
      brand: '',
      modelId: '',
      pendingPhoneName: null,
      pendingRequestId: null,
    };
  }

  // Initialized from a cart item's printSpec
  if ('phoneModelStatus' in source) {
    if (source.phoneModelStatus === 'pending') {
      return {
        status: 'pending',
        brand: '',
        modelId: '',
        pendingPhoneName: source.phoneModelName || 'موديلك بيتأكد',
        pendingRequestId: source.pendingRequestId || null,
      };
    }
    if (source.phoneModelId) {
      const found = allPhoneModels.find((m) => m.id === source.phoneModelId);
      if (found) {
        return {
          status: 'selected',
          brand: found.brand,
          modelId: found.id,
          pendingPhoneName: null,
          pendingRequestId: null,
        };
      }
    }
    return {
      status: 'none',
      brand: '',
      modelId: '',
      pendingPhoneName: null,
      pendingRequestId: null,
    };
  }

  // Initialized from StoreContext.phoneSelection
  if (source.status === 'pending') {
    return {
      status: 'pending',
      brand: '',
      modelId: '',
      pendingPhoneName: source.pendingPhoneName || 'موديلك بيتأكد',
      pendingRequestId: source.pendingRequestId || null,
    };
  }

  if (source.status === 'selected' && source.modelId) {
    const found = allPhoneModels.find((m) => m.id === source.modelId);
    if (found) {
      return {
        status: 'selected',
        brand: found.brand,
        modelId: found.id,
        pendingPhoneName: null,
        pendingRequestId: null,
      };
    }
  }

  return {
    status: 'none',
    brand: '',
    modelId: '',
    pendingPhoneName: null,
    pendingRequestId: null,
  };
}

/**
 * Single shared "موبايلي مش في القايمة" request form used by BOTH the Header ModelSelector
 * and per-item PhoneModelFields so validation and copy are never duplicated.
 */
export function MissingPhoneRequestForm({
  onSubmitRequest,
  onCancel = null,
  submitLabel = 'ابعت الطلب',
  compact = false,
}) {
  const uid = useId();
  const [phoneNameInput, setPhoneNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errors = {};
    const cleanPhone = phoneNameInput.trim();
    const cleanMobile = mobileInput.replace(/\s+/g, '');

    if (cleanPhone.length < 2) {
      errors.phoneName = 'اكتب اسم الموبايل والموديل الأول.';
    }
    if (!EGYPT_MOBILE_REGEX.test(cleanMobile)) {
      errors.mobileNumber = 'اكتب رقم موبايل مصري صحيح من 11 رقم بيبدأ بـ 010 أو 011 أو 012 أو 015.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onSubmitRequest({ phoneName: cleanPhone, mobileNumber: cleanMobile });
    setPhoneNameInput('');
    setMobileInput('');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={compact ? 'space-y-3' : 'space-y-4'}>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-[36px] items-center gap-1.5 text-[13.5px] font-bold text-[var(--ink)] hover:text-[var(--brand)] cursor-pointer"
        >
          <BackArrowRtlIcon className="h-3.5 w-3.5" />
          <span>رجوع لاختيار الموديل</span>
        </button>
      ) : null}

      <p className="text-[13.5px] leading-[1.6] text-[var(--ink-muted)]">
        اكتب نوع موبايلك ورقمك وهنتأكدلك إن مقاسه متاح عندنا قبل الطباعة.
      </p>

      <div>
        <label
          htmlFor={`missing-phone-name-${uid}`}
          className="mb-1 block text-[13.5px] font-semibold text-[var(--ink)]"
        >
          اسم الموبايل والموديل
        </label>
        <input
          ref={inputRef}
          id={`missing-phone-name-${uid}`}
          type="text"
          value={phoneNameInput}
          onChange={(e) => {
            setPhoneNameInput(e.target.value);
            setFormErrors((prev) => ({ ...prev, phoneName: undefined }));
          }}
          placeholder="مثلا: Nothing Phone 2a"
          aria-invalid={Boolean(formErrors.phoneName)}
          className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[14.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
        />
        {formErrors.phoneName ? (
          <p className="mt-1 text-[12.5px] font-semibold text-[var(--brand)]">
            {formErrors.phoneName}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={`missing-phone-mobile-${uid}`}
          className="mb-1 block text-[13.5px] font-semibold text-[var(--ink)]"
        >
          رقم الموبايل
        </label>
        <input
          id={`missing-phone-mobile-${uid}`}
          type="tel"
          dir="ltr"
          inputMode="numeric"
          maxLength={11}
          value={mobileInput}
          onChange={(e) => {
            setMobileInput(e.target.value.replace(/[^\d]/g, '').slice(0, 11));
            setFormErrors((prev) => ({ ...prev, mobileNumber: undefined }));
          }}
          placeholder="01012345678"
          aria-invalid={Boolean(formErrors.mobileNumber)}
          className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-start text-[14.5px] tabular-nums text-[var(--ink)] placeholder:text-[var(--ink-muted)]"
        />
        {formErrors.mobileNumber ? (
          <p className="mt-1 text-[12.5px] font-semibold text-[var(--brand)]">
            {formErrors.mobileNumber}
          </p>
        ) : null}
      </div>

      <button type="submit" className="btn-primary w-full !min-h-[44px]">
        {submitLabel}
      </button>
    </form>
  );
}

/**
 * Reusable Per-Item Phone Selector ("الماركة" -> "الموديل" + "موبايلي مش في القايمة").
 * Reuses the exact `phoneBrands` and `allPhoneModels` data from `StoreContext` without
 * altering the site-wide header filter.
 */
export function PhoneModelFields({
  value,
  onChange,
  compatibleModelIds = null,
  error = '',
  compact = false,
  brandSelectRef = null,
  modelSelectRef = null,
  containerRef = null,
}) {
  const { phoneBrands, allPhoneModels, submitItemMissingPhone } = useStore();
  const uid = useId();
  const [showMissingForm, setShowMissingForm] = useState(false);

  const selectedBrand = value?.brand || '';
  const selectedModelId = value?.status === 'selected' ? value.modelId || '' : '';

  const modelsForBrand = useMemo(() => {
    if (!selectedBrand) return [];
    return allPhoneModels.filter((m) => m.brand === selectedBrand);
  }, [allPhoneModels, selectedBrand]);

  const selectedModelObj = useMemo(() => {
    if (!selectedModelId) return null;
    return allPhoneModels.find((m) => m.id === selectedModelId) || null;
  }, [allPhoneModels, selectedModelId]);

  const isIncompatible =
    Boolean(selectedModelObj) &&
    Array.isArray(compatibleModelIds) &&
    !compatibleModelIds.includes(selectedModelObj.id);

  const handleBrandChange = (nextBrand) => {
    setShowMissingForm(false);
    if (!nextBrand) {
      onChange({
        status: 'none',
        brand: '',
        modelId: '',
        pendingPhoneName: null,
        pendingRequestId: null,
      });
      return;
    }
    onChange({
      status: 'none',
      brand: nextBrand,
      modelId: '',
      pendingPhoneName: null,
      pendingRequestId: null,
    });
  };

  const handleModelChange = (nextModelId) => {
    if (!nextModelId) {
      onChange({
        status: 'none',
        brand: selectedBrand,
        modelId: '',
        pendingPhoneName: null,
        pendingRequestId: null,
      });
      return;
    }
    const found = allPhoneModels.find((m) => m.id === nextModelId);
    onChange({
      status: 'selected',
      brand: found?.brand || selectedBrand,
      modelId: nextModelId,
      pendingPhoneName: null,
      pendingRequestId: null,
    });
  };

  const handleMissingSubmitted = ({ phoneName, mobileNumber }) => {
    const record = submitItemMissingPhone({ phoneName, mobileNumber });
    setShowMissingForm(false);
    onChange({
      status: 'pending',
      brand: '',
      modelId: '',
      pendingPhoneName: record.phoneName,
      pendingRequestId: record.id,
    });
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-[var(--radius-stage)] border bg-[var(--surface)] ${
        error || isIncompatible
          ? 'border-[var(--brand)]'
          : 'border-[var(--border-subtle)]'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PhoneHardwareIcon className="h-4 w-4 text-[var(--ink)]" />
          <span className={compact ? 'text-[14px] font-bold text-[var(--ink)]' : 'type-h3 !text-[17px] text-[var(--ink)]'}>
            نوع الموبايل للجراب ده
          </span>
        </div>

        {value?.status === 'selected' && selectedModelObj && !isIncompatible ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--jade-tint)] px-2.5 py-0.5 text-[12px] font-bold text-[var(--jade)]">
            <CheckIcon className="h-3 w-3" />
            <span>متاح للموديل ده</span>
          </span>
        ) : null}
      </div>

      {showMissingForm ? (
        <MissingPhoneRequestForm
          compact={compact}
          onCancel={() => setShowMissingForm(false)}
          onSubmitRequest={handleMissingSubmitted}
        />
      ) : value?.status === 'pending' ? (
        <div className="space-y-2.5 rounded-[var(--radius-ui)] bg-[var(--brand-yellow-tint)] p-3.5">
          <p className="text-[14px] font-bold text-[var(--ink)]">
            موديلك بيتأكد من خدمة العملاء:{' '}
            <bdi dir="ltr" className="latin-title">
              {value.pendingPhoneName}
            </bdi>
          </p>
          <p className="text-[12.5px] text-[var(--ink-muted)]">
            تقدر تضيف الجراب للسلة عادي، وخدمة العملاء هتكلمك تأكد المقاس قبل الطباعة.
          </p>
          <button
            type="button"
            onClick={() =>
              onChange({
                status: 'none',
                brand: phoneBrands[0] || '',
                modelId: '',
                pendingPhoneName: null,
                pendingRequestId: null,
              })
            }
            className="btn-secondary !min-h-[34px] !text-[13px]"
          >
            اختار موديل من القايمة بداله
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`item-brand-${uid}`}
                className="mb-1.5 block text-[13.5px] font-semibold text-[var(--ink)]"
              >
                الماركة
              </label>
              <select
                ref={brandSelectRef}
                id={`item-brand-${uid}`}
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3 text-[14.5px] font-medium text-[var(--ink)] cursor-pointer"
              >
                <option value="">اختار الماركة...</option>
                {phoneBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`item-model-${uid}`}
                className="mb-1.5 block text-[13.5px] font-semibold text-[var(--ink)]"
              >
                الموديل
              </label>
              <select
                ref={modelSelectRef}
                id={`item-model-${uid}`}
                value={selectedModelId}
                disabled={!selectedBrand}
                onChange={(e) => handleModelChange(e.target.value)}
                className="min-h-[44px] w-full rounded-[var(--radius-ui)] border border-[var(--border-strong)] bg-[var(--paper)] px-3 text-[14.5px] font-medium text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-55 cursor-pointer"
              >
                <option value="">
                  {selectedBrand ? 'اختار الموديل...' : 'اختار الماركة الأول'}
                </option>
                {modelsForBrand.map((model) => {
                  const compat =
                    !Array.isArray(compatibleModelIds) || compatibleModelIds.includes(model.id);
                  return (
                    <option key={model.id} value={model.id}>
                      {compat ? model.name : `${model.name} — غير متاح للتصميم ده`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-2.5 text-[13.5px] font-bold text-[var(--brand)]">
              {error}
            </p>
          ) : null}

          {isIncompatible && selectedModelObj ? (
            <p role="alert" className="mt-2.5 rounded-[var(--radius-ui)] bg-[var(--brand-tint)] px-3 py-2 text-[13.5px] font-bold text-[var(--brand)]">
              التصميم ده مش متاح لموديل{' '}
              <bdi dir="ltr" className="latin-title">
                {selectedModelObj.name}
              </bdi>{' '}
              حاليا. اختار موديل تاني أو صمم جرابك بصورتك.
            </p>
          ) : null}

          <div className="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMissingForm(true)}
              className="btn-secondary !min-h-[34px] !text-[13px] text-[var(--ink-muted)]"
            >
              موبايلي مش في القايمة
            </button>
          </div>
        </>
      )}
    </div>
  );
}
