// ============================================================//
//  DescriptionGenerator.jsx — Smart ECO Description Button    //
//  1.2s artificial delay makes it feel like AI processing     //
// ============================================================//
import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateDescription } from '../../services/generateService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function DescriptionGenerator({ eco, changes, onGenerate }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!changes || changes.length === 0 || !changes.some(c => (c.field || '').trim())) {
      toast.error(t('toasts.add_change_toast', 'Add at least one change first'));
      return;
    }

    setLoading(true);
    try {
      // Minimum 1.2s delay — makes it feel like AI thinking
      const [description] = await Promise.all([
        generateDescription(eco, changes),
        new Promise(r => setTimeout(r, 1200))
      ]);
      onGenerate(description);
      setGenerated(true);
      toast.success(t('toasts.desc_generated_toast', 'Description generated'));
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(t('toasts.gen_failed_toast', 'Generation failed — try again'));
    } finally {
      setLoading(false);
    }
  };

  const hasValidChanges = changes && changes.length > 0 && changes.some(c => (c.field || '').trim());

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !hasValidChanges}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm hover:shadow-md"
        style={{
          background: loading
            ? '#F3F4F6'
            : 'linear-gradient(135deg, #A59D84, #8C8570)',
          color: loading ? '#9CA3AF' : '#FFFFFF',
          border: 'none',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {t('eco.generating', 'Generating...')}
          </>
        ) : (
          <>
            <Sparkles size={14} />
            {t('eco.generate_desc', 'Generate Description')}
          </>
        )}
      </button>
      {generated && (
        <p style={{ fontSize: '11px', color: '#A59D84' }}>
          ✦ {t('eco.ai_generated', 'AI-generated — you can edit this')}
        </p>
      )}
    </div>
  );
}
