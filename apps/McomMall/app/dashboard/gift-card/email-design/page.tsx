'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Gift, Plus, Save, Trash2 } from 'lucide-react';
import {
  useCreateGiftCardTheme,
  useDeleteGiftCardTheme,
  useMyGiftCardThemes,
  useUpdateGiftCardTheme,
  type GiftCardTheme,
} from '@/service/gift-card/themes';
import { CURRENCY } from '@/lib/utils';

const CATEGORIES = ['General', 'Birthday', 'Anniversary', 'Holiday', 'Thank You'];

export default function EmailDesignPage() {
  const themesQuery = useMyGiftCardThemes();
  const createTheme = useCreateGiftCardTheme();
  const updateTheme = useUpdateGiftCardTheme();
  const deleteTheme = useDeleteGiftCardTheme();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [primaryColor, setPrimaryColor] = useState('#ea580c');
  const [secondaryColor, setSecondaryColor] = useState('#a14000');
  const [badgeText, setBadgeText] = useState('Happy Birthday');
  const [isPublic, setIsPublic] = useState(false);

  const themes = useMemo(() => themesQuery.data ?? [], [themesQuery.data]);

  const selected = themes.find((theme) => theme.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    setName(selected.name);
    setCategory(selected.category || 'General');
    setPrimaryColor(selected.primaryColor || '#ea580c');
    setSecondaryColor(selected.secondaryColor || '#a14000');
    setBadgeText(selected.badgeText || '');
    setIsPublic(selected.isPublic);
  }, [selected]);

  const resetForm = () => {
    setSelectedId(null);
    setName('');
    setCategory('General');
    setPrimaryColor('#ea580c');
    setSecondaryColor('#a14000');
    setBadgeText('Happy Birthday');
    setIsPublic(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Theme name is required.');
      return;
    }
    const payload: Partial<GiftCardTheme> = {
      name: name.trim(),
      category,
      primaryColor,
      secondaryColor,
      badgeText,
      isPublic,
    };

    try {
      if (selected) {
        await updateTheme.mutateAsync({ id: selected.id, ...payload });
        toast.success('Theme updated.');
      } else {
        await createTheme.mutateAsync(payload);
        toast.success('Theme created.');
        resetForm();
      }
    } catch {
      toast.error('Could not save the theme.');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm(`Delete "${selected.name}"?`)) return;
    try {
      await deleteTheme.mutateAsync(selected.id);
      resetForm();
      toast.success('Theme deleted.');
    } catch {
      toast.error('Could not delete the theme.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/gift-card"
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Designs</h1>
              <p className="text-sm text-gray-500">
                Create the gift card themes used in customer emails.
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
          >
            <Plus className="h-4 w-4" /> New theme
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">
              Your themes
            </h2>
            {themesQuery.isLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : themes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                No custom themes yet. Create one to brand your emails.
              </p>
            ) : (
              themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedId(theme.id)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${
                    selectedId === theme.id
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-100 bg-white hover:border-orange-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {theme.name}
                    </p>
                    <p className="text-xs text-gray-500">{theme.category}</p>
                  </div>
                  <span className="flex gap-1">
                    <span
                      className="h-4 w-4 rounded-full border border-white shadow"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-white shadow"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                {selected ? 'Edit theme' : 'New theme'}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500">Name</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Primary colour
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(event) => setPrimaryColor(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Secondary colour
                  </label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(event) => setSecondaryColor(event.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Badge text
                  </label>
                  <input
                    value={badgeText}
                    onChange={(event) => setBadgeText(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <label className="mt-6 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                  />
                  Share publicly
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={handleSave}
                  disabled={createTheme.isPending || updateTheme.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {selected ? 'Save changes' : 'Create theme'}
                </button>
                {selected && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteTheme.isPending}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
                Preview
              </h2>
              <div
                className="rounded-xl p-6 text-white shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <Gift className="mb-4 h-8 w-8" />
                {badgeText && (
                  <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                    {badgeText}
                  </p>
                )}
                <p className="mt-2 text-2xl font-bold">{name || 'Gift Card'}</p>
                <p className="mt-1 font-mono text-sm text-white/80">
                  •••• •••• •••• ••{String(Math.max(1, name.length)).padStart(2, '0')}
                </p>
                <p className="mt-4 text-3xl font-bold">{CURRENCY}50.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
