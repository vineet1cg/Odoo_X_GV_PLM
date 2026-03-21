import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useRoleAccess from '../../hooks/useRoleAccess';
import {
  Send, Edit3, Trash2, CheckCircle, XCircle, ShieldAlert,
  ChevronDown, AlertTriangle, Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * ECOActionBar — Role-aware action buttons for ECO detail pages.
 * Renders different buttons based on user role AND ECO stage.
 */
export default function ECOActionBar({
  eco,
  onSubmitForReview,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onForceAdvance,
}) {
  const { t } = useTranslation();
  const { canCreateECO, canApproveECO, isAdmin, isOperations, isEngineer, isApprover } = useRoleAccess();
  const [showConfirm, setShowConfirm] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const stage = eco?.stage || 'New';

  const handleConfirmAction = useCallback(() => {
    if (showConfirm === 'submit') onSubmitForReview?.();
    else if (showConfirm === 'approve') onApprove?.();
    else if (showConfirm === 'reject' && rejectReason.length >= 20) {
      onReject?.(rejectReason);
      setRejectReason('');
    }
    else if (showConfirm === 'delete') onDelete?.();
    setShowConfirm(null);
  }, [showConfirm, rejectReason, onSubmitForReview, onApprove, onReject, onDelete]);

  if (isOperations) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0',
        }}
      >
        <Eye size={16} style={{ color: '#64748B' }} />
        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
          {t('eco.view_only_access', 'You have view-only access to this ECO.')}
        </span>
      </div>
    );
  }

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'all 150ms ease', letterSpacing: '-0.01em',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const primaryBtn = { ...btnBase, background: '#0D9488', color: '#fff' };
  const successBtn = { ...btnBase, background: '#10B981', color: '#fff' };
  const dangerBtn = { ...btnBase, background: 'transparent', color: '#EF4444', border: '1.5px solid #FECACA' };
  const outlineBtn = { ...btnBase, background: 'transparent', color: '#0F172A', border: '1.5px solid #E2E8F0' };
  const disabledBadge = {
    ...btnBase, background: '#F1F5F9', color: '#94A3B8', cursor: 'default', border: '1px solid #E2E8F0',
  };

  const renderEngineerActions = () => {
    if (stage === 'New' || stage === 'In Review') {
      return (
        <>
          <button style={primaryBtn} onClick={() => setShowConfirm('submit')}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.01)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
          >
            <Send size={14} /> {t('actions.submit_for_review', 'Submit for Review')}
          </button>
          <button style={outlineBtn} onClick={onEdit}
            onMouseEnter={e => { e.target.style.background = '#F8FAFC'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
          >
            <Edit3 size={14} /> {t('actions.edit_eco', 'Edit ECO')}
          </button>
          {stage === 'New' && (
            <button style={dangerBtn} onClick={() => setShowConfirm('delete')}
              onMouseEnter={e => { e.target.style.background = '#FEF2F2'; }}
              onMouseLeave={e => { e.target.style.background = 'transparent'; }}
            >
              <Trash2 size={14} /> {t('actions.delete', 'Delete')}
            </button>
          )}
        </>
      );
    }
    if (stage === 'Approval') {
      return <span style={disabledBadge}><ShieldAlert size={14} /> {t('status.awaiting_approval', 'Awaiting Approval')}</span>;
    }
    return null;
  };

  const renderApproverActions = () => {
    if (stage === 'Approval') {
      return (
        <>
          <button style={successBtn} onClick={() => setShowConfirm('approve')}
            onMouseEnter={e => { e.target.style.transform = 'scale(1.01)'; }}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
          >
            <CheckCircle size={14} /> {t('actions.approve', 'Approve')}
          </button>
          <button style={dangerBtn} onClick={() => setShowConfirm('reject')}
            onMouseEnter={e => { e.target.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; }}
          >
            <XCircle size={14} /> {t('actions.reject', 'Reject')}
          </button>
        </>
      );
    }
    return (
      <span style={disabledBadge}>
        <AlertTriangle size={14} /> {t('status.not_in_approval', 'Not yet in approval')}
      </span>
    );
  };

  const adminStages = ['New', 'In Review', 'Approval'];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {isEngineer && !isAdmin && renderEngineerActions()}
        {isApprover && !isAdmin && renderApproverActions()}

        {isAdmin && (
          <>
            {(stage === 'New' || stage === 'In Review') && (
              <>
                <button style={primaryBtn} onClick={() => setShowConfirm('submit')}>
                  <Send size={14} /> {t('actions.submit_for_review', 'Submit for Review')}
                </button>
                <button style={outlineBtn} onClick={onEdit}>
                  <Edit3 size={14} /> {t('actions.edit_eco', 'Edit ECO')}
                </button>
              </>
            )}
            {stage === 'Approval' && (
              <>
                <button style={successBtn} onClick={() => setShowConfirm('approve')}>
                  <CheckCircle size={14} /> {t('actions.approve', 'Approve')}
                </button>
                <button style={dangerBtn} onClick={() => setShowConfirm('reject')}>
                  <XCircle size={14} /> {t('actions.reject', 'Reject')}
                </button>
              </>
            )}
            {adminStages.includes(stage) && (
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...outlineBtn, gap: 6 }}
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                >
                  {t('actions.force_advance', 'Force Advance')} <ChevronDown size={12} />
                </button>
                {showAdminMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 4,
                    background: '#fff', borderRadius: 8, border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)', zIndex: 50, minWidth: 180, overflow: 'hidden',
                  }}>
                    {['In Review', 'Approval', 'Done'].filter(s => s !== stage).map(s => (
                      <button key={s}
                        style={{
                          display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                          fontSize: 13, background: 'transparent', border: 'none', cursor: 'pointer',
                          color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onClick={() => { onForceAdvance?.(s); setShowAdminMenu(false); }}
                        onMouseEnter={e => { e.target.style.background = '#F8FAFC'; }}
                        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      >
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm / Reject Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              marginTop: 16, padding: 20, background: '#F8FAFC', borderRadius: 12,
              border: '1px solid #E2E8F0',
            }}
          >
            {showConfirm === 'reject' ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                  {t('eco.rejection_reason', 'Rejection Reason')} <span style={{ color: '#EF4444' }}>*</span>
                </p>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder={t('eco.rejection_placeholder', 'Please provide a detailed reason (min 20 characters)...')}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1.5px solid #E2E8F0', resize: 'none', outline: 'none',
                    fontFamily: 'Inter, system-ui, sans-serif', background: '#fff',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#0D9488'; e.target.style.boxShadow = '0 0 0 2px rgba(13,148,136,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: rejectReason.length >= 20 ? '#10B981' : '#94A3B8' }}>
                    {rejectReason.length}/{t('eco.char_min', { min: 20 }, '20 characters minimum')}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={outlineBtn} onClick={() => { setShowConfirm(null); setRejectReason(''); }}>{t('actions.cancel', 'Cancel')}</button>
                    <button
                      style={{ ...btnBase, background: rejectReason.length >= 20 ? '#EF4444' : '#FCA5A5', color: '#fff', cursor: rejectReason.length >= 20 ? 'pointer' : 'not-allowed' }}
                      onClick={handleConfirmAction}
                      disabled={rejectReason.length < 20}
                    >
                      {t('actions.confirm_rejection', 'Confirm Rejection')}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>
                  {showConfirm === 'submit' && t('eco.confirm_submit', 'Submit this ECO for review?')}
                  {showConfirm === 'approve' && t('eco.confirm_approve', 'Approve this ECO? Changes will be applied to production.')}
                  {showConfirm === 'delete' && t('eco.confirm_delete', 'Delete this ECO? This action cannot be undone.')}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={outlineBtn} onClick={() => setShowConfirm(null)}>{t('actions.cancel', 'Cancel')}</button>
                  <button
                    style={{
                      ...btnBase,
                      background: showConfirm === 'delete' ? '#EF4444' : '#0D9488',
                      color: '#fff',
                    }}
                    onClick={handleConfirmAction}
                  >
                    {t('actions.confirm', 'Confirm')}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
