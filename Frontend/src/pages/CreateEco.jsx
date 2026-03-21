// ============================================================//
//  CreateEco.jsx — ECO CREATION FORM                          //
//  Multi-section: Info, Change Details, Images                //
//  Role-gated: Only Engineers + Admins can access             //
// ============================================================//
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageUpload from '../components/ui/ImageUpload';
import { ArrowLeft, Plus, Trash2, CalendarDays, ToggleLeft, ToggleRight, ImageIcon, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DescriptionGenerator from '../components/ECO/DescriptionGenerator';
export default function CreateEco() {
  const { t } = useTranslation();
  const { products, bomList, addEco, canCreateEco } = useApp();
  const navigate = useNavigate();

  // ==========================================//
  //  FORM STATE — All ECO form fields         //
  // ==========================================//
  const [form, setForm] = useState({
    title: '',
    type: 'Product',
    productId: '',
    bomId: '',
    effectiveDate: '',
    versionUpdate: true,
    newVersion: '',
    description: '',
    priority: 'Medium', // Added priority based on instruction
  });

  const [changes, setChanges] = useState([
    { field: '', oldValue: '', newValue: '', type: 'modified' },
  ]);

  const [uploadedImages, setUploadedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false); // Added for AI generation

  // ==========================================//
  //  ROLE GATE — Block non-engineers          //
  // ==========================================//
  if (!canCreateEco) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-surface-600 font-medium mb-2">{t('create_eco.access_restricted')}</p>
        <p className="text-sm text-surface-400">{t('create_eco.access_restricted_desc')}</p>
        <Link to="/eco" className="mt-4 text-sm text-primary-600 hover:underline">← {t('create_eco.back_to_ecos')}</Link>
      </div>
    );
  }

  const selectedProduct = products.find(p => p.id === form.productId);
  const productBoms = bomList.filter(b => b.productId === form.productId);

  const addChange = () => {
    setChanges(prev => [...prev, { field: '', oldValue: '', newValue: '', type: 'modified' }]);
  };

  const removeChange = (idx) => {
    setChanges(prev => prev.filter((_, i) => i !== idx));
  };

  const updateChange = (idx, key, value) => {
    setChanges(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c));
  };

  // ==========================================//
  //  SUBMIT HANDLER — Validates + creates ECO //
  // ==========================================//
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.productId) {
      toast.error(t('create_eco.title_product_required'));
      return;
    }

    const validChanges = changes.filter(c => c.field.trim());
    const product = products.find(p => p.id === form.productId);

    // Build image changes from uploaded images
    const imageChanges = uploadedImages.map((img, idx) => ({
      id: `ic_new_${idx}`,
      label: img.name,
      changeType: 'added',
      oldImage: null,
      newImage: { id: img.id, name: img.name, url: img.url, category: img.category },
      reviewStatus: null,
      reviewComment: null,
      reviewedBy: null,
    }));

    const eco = await addEco({
      title: form.title,
      type: form.type,
      productId: form.productId,
      productName: product?.name || '',
      bomId: form.type === 'BoM' ? form.bomId : undefined,
      effectiveDate: form.effectiveDate,
      versionUpdate: form.versionUpdate,
      newVersion: form.newVersion || null,
      description: form.description,
      priority: form.priority, // Use priority from form state
      changes: validChanges,
      attachedImages: uploadedImages,
      imageChanges,
    });

    if (eco && (eco.id || eco._id)) {
      navigate(`/eco/${eco.id || eco._id}`);
    } else {
      navigate('/eco');
    }
  };


  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/eco" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 transition-colors">
        <ArrowLeft size={16} /> {t('create_eco.back_to_ecos')}
      </Link>

      <div>
        <div className="flex items-center gap-2 text-primary-600 mb-2">
          <span className="text-xs font-bold uppercase tracking-widest">{t('create_eco.draft_new')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">{t('create_eco.eco')}</h1>
        <p className="text-surface-500 mt-2">{t('create_eco.submit_sub')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ECO Info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-100 rounded-xl border border-surface-200">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-2">
            <h2 className="text-lg font-bold text-surface-800">{t('create_eco.general_info')}</h2>
          </div>
          <div className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.eco_title')} <span className="text-danger-500">*</span></label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder={t('create_eco.title_ph')}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition font-medium text-surface-800"
                />
              </div>

              {/* ECO Type */}
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.eco_type')} <span className="text-danger-500">*</span></label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value, bomId: '' })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 font-medium text-surface-800"
                >
                  <option value="Product">{t('create_eco.product_change')}</option>
                  <option value="BoM">{t('create_eco.bom_change')}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.priority')}</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 font-medium text-surface-800"
                >
                  <option value="Low">{t('priority.Low')}</option>
                  <option value="Medium">{t('priority.Medium')}</option>
                  <option value="High">{t('priority.High')}</option>
                </select>
              </div>

              {/* Target Product */}
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.target_product')} <span className="text-danger-500">*</span></label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value, bomId: '' })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 font-medium text-surface-800"
                >
                  <option value="">{t('create_eco.select_product')}</option>
                  {products.filter(p => p.status === 'Active').map(p => (
                    <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                  ))}
                </select>
              </div>

              {form.type === 'BoM' && form.productId && (
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.target_bom')}</label>
                  <select
                    value={form.bomId}
                    onChange={e => setForm({ ...form, bomId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 font-medium text-surface-800"
                  >
                    <option value="">{t('create_eco.select_bom')}</option>
                    {productBoms.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (v{b.version})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Effective Date */}
              <div>
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.effective_date')}</label>
                <div className="relative">
                  <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition font-medium text-surface-800"
                  />
                </div>
              </div>

              {/* Version Update Toggle */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, versionUpdate: !form.versionUpdate })}
                  className="text-primary-600"
                >
                  {form.versionUpdate ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-surface-400" />}
                </button>
                <div>
                  <p className="text-sm font-bold text-surface-700">{t('create_eco.version_update')}</p>
                  <p className="text-xs text-surface-400">{form.versionUpdate ? t('create_eco.version_update_on') : t('create_eco.version_update_off')}</p>
                </div>
              </div>

              {form.versionUpdate && (
                <div>
                  <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.new_version')}</label>
                  <input
                    type="text"
                    value={form.newVersion}
                    onChange={e => setForm({ ...form, newVersion: e.target.value })}
                    placeholder={selectedProduct ? `e.g., ${parseFloat(selectedProduct.version) + 0.1}` : 'e.g., 2.1'}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition font-medium text-surface-800"
                  />
                </div>
              )}

              {/* Reason */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-surface-700 mb-2">{t('create_eco.reason')} <span className="text-danger-500">*</span></label>
                <textarea
                  required
                  rows="3"
                  placeholder={t('create_eco.reason_ph')}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition resize-none font-medium text-surface-800"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Editor */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-100 rounded-xl border border-surface-200">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-800">{t('create_eco.specific_changes')}</h2>
            <span className="text-xs font-medium text-surface-500 bg-surface-100 px-2 py-1 rounded-md">{t('create_eco.list_fields')}</span>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-50">
                    <th className="px-4 py-3 text-xs font-bold text-surface-500 uppercase rounded-tl-xl">{t('create_eco.field_spec')}</th>
                    <th className="px-4 py-3 text-xs font-bold text-surface-500 uppercase">{t('create_eco.old_val')}</th>
                    <th className="px-4 py-3 text-xs font-bold text-surface-500 uppercase">{t('create_eco.new_val')}</th>
                    <th className="px-4 py-3 text-xs font-bold text-surface-500 uppercase">{t('create_eco.type')}</th>
                    <th className="w-12 px-4 py-3 rounded-tr-xl"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="wait">
                    {changes.map((change, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <td className="px-4 py-2 border-t border-surface-100">
                          <input
                            type="text"
                            value={change.field}
                            onChange={e => updateChange(idx, 'field', e.target.value)}
                            placeholder={t('create_eco.field_spec_ph')}
                            className="w-full px-3 py-2 text-sm rounded bg-surface-50 border-transparent focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all font-medium text-surface-800"
                          />
                        </td>
                        <td className="px-4 py-2 border-t border-surface-100">
                          <input
                            type="text"
                            value={change.oldValue}
                            onChange={e => updateChange(idx, 'oldValue', e.target.value)}
                            placeholder={t('create_eco.old_val_ph')}
                            className="w-full px-3 py-2 text-sm rounded bg-surface-50 border-transparent focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-surface-600 line-through decoration-surface-400"
                          />
                        </td>
                        <td className="px-4 py-2 border-t border-surface-100">
                          <input
                            type="text"
                            value={change.newValue}
                            onChange={e => updateChange(idx, 'newValue', e.target.value)}
                            placeholder={t('create_eco.new_val_ph')}
                            className="w-full px-3 py-2 text-sm rounded bg-primary-50/50 border-transparent focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all font-medium text-primary-700"
                          />
                        </td>
                        <td className="px-4 py-2 border-t border-surface-100">
                          <select
                            value={change.type}
                            onChange={e => updateChange(idx, 'type', e.target.value)}
                            className="w-full px-3 py-2 rounded bg-surface-50 border-transparent text-sm focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all font-medium text-surface-800"
                          >
                            <option value="modified">{t('eco.modified', 'Modified')}</option>
                            <option value="added">{t('eco.added', 'Added')}</option>
                            <option value="removed">{t('eco.removed', 'Removed')}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 border-t border-surface-100">
                          {changes.length > 1 && (
                            <button type="button" onClick={() => removeChange(idx)} className="p-2 text-surface-400 hover:text-danger-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addChange}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus size={16} /> {t('create_eco.add_change')}
            </button>
          </div>
        </motion.div>

        {/* Description Generation */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-surface-100 rounded-xl border border-surface-200">
          <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-800">{t('eco.impact_analysis', 'AI Description Generator')}</h2>
          </div>
          <div className="p-6">
            <DescriptionGenerator
              eco={{
                type: form.type,
                productName: selectedProduct?.name || '',
                priority: form.priority,
                effectiveDate: form.effectiveDate,
              }}
              changes={changes}
              onGenerate={(text) => setForm(prev => ({ ...prev, description: text }))}
            />
          </div>
        </motion.div>

        {/* Image Attachments */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-100 rounded-xl border border-surface-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-800">{t('eco.attached_images', 'Attachments / Images')}</h2>
            {uploadedImages.length > 0 && (
              <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">{uploadedImages.length}</span>
            )}
          </div>
          <p className="text-sm text-surface-400">{t('image_upload.hint', 'Upload product images, BoM diagrams, design sketches, or supporting documents. These will be reviewed during the approval process.')}</p>
          <ImageUpload
            images={uploadedImages}
            onImagesChange={setUploadedImages}
            disabled={false}
          />
        </motion.div>

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end">
          <Link to="/eco" className="px-5 py-2.5 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors">
            {t('actions.cancel', 'Cancel')}
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            {t('eco.create', 'Create ECO')}
          </button>
        </div>
      </form>
    </div>
  );
}
