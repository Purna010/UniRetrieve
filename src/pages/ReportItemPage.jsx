import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import LocationPicker from '../components/map/LocationPicker';
import { mockCategories } from '../data/mockItems';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';
import SuccessOverlay from '../components/ui/SuccessOverlay';
import { classifyImage } from '../utils/classifier';

const ITEM_TYPES = ['Lost', 'Found'];

export default function ReportItemPage() {
  const { submitItemReport, isLoading } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    type: 'lost',
    title: '',
    category: '',
    description: '',
    location: null,
    date: '',
    images: [],
    tags: [],
    aiTags: [],
  });
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [showEnlargedMap, setShowEnlargedMap] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [aiClassification, setAiClassification] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let errorMsgs = [];
    let validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        errorMsgs.push(`${f.name} is not an image.`);
        return false;
      }
      if (f.size > 4 * 1024 * 1024) {
        errorMsgs.push(`${f.name} exceeds 4MB limit.`);
        return false;
      }
      return true;
    });

    if (errorMsgs.length > 0) {
      alert(errorMsgs.join('\n'));
    }

    if (validFiles.length > 0) {
      
      setIsScanning(true);
      setScanProgress(0);
      setAiClassification(null);

      let finalImages = [];
      setForm(prev => {
        const newImages = [...prev.images, ...validFiles].slice(0, 4);
        finalImages = newImages;
        setPreviews(newImages.map(file => typeof file === 'string' ? file : URL.createObjectURL(file)));
        return { ...prev, images: newImages };
      });

      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setScanProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          
          
          const filesToClassify = finalImages.filter(file => typeof file !== 'string');
          
          if (filesToClassify.length > 0) {
            const promises = filesToClassify.map(file => classifyImage(file));
            
            Promise.all(promises).then(results => {
              const validResults = results.filter(r => r && r.category !== 'Unable to detect');
              
              if (validResults.length > 0) {
                
                validResults.sort((a, b) => b.confidence - a.confidence);
                const bestResult = validResults[0];
                
                
                const allTagsSet = new Set();
                validResults.forEach(res => {
                  (res.tags || []).forEach(t => allTagsSet.add(t));
                });
                const mergedTags = Array.from(allTagsSet);
                
                setAiClassification({
                  category: bestResult.category,
                  title: bestResult.title,
                  tags: mergedTags,
                  confidence: bestResult.confidence
                });

                setForm(prev => {
                  const combinedTags = Array.from(new Set([...(prev.tags || []), ...mergedTags]));
                  return {
                    ...prev,
                    category: bestResult.category,
                    title: prev.title.trim() === '' ? bestResult.title : prev.title,
                    tags: combinedTags,
                    aiTags: mergedTags,
                  };
                });
              } else {
                setAiClassification({
                  category: 'Unable to detect',
                  title: 'Unable to detect',
                  tags: [],
                  confidence: 0
                });
              }
              setIsScanning(false);
            }).catch(err => {
              console.error('Classification error:', err);
              setIsScanning(false);
            });
          } else {
            setIsScanning(false);
          }
        }
      }, 150); 
    }

    
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (index) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      setPreviews(newImages.map(file => typeof file === 'string' ? file : URL.createObjectURL(file)));
      return { ...prev, images: newImages };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.location) e.location = 'Please pin the location on the map';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const success = await submitItemReport(form);
    console.log('Submission result:', success);
    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/my-items');
      }, 3000);
    }
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-white mb-1">Report an Item</h1>
        <p className="text-sm text-white/40">Fill in the details below to report a lost or found item on campus.</p>
      </motion.div>

      {/* Type selector */}
      <motion.div variants={staggerItem} className="flex gap-4">
        {ITEM_TYPES.map(t => (
          <button
            key={t}
            id={`type-${t.toLowerCase()}`}
            onClick={() => set('type', t.toLowerCase())}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border backdrop-blur-md ${
              form.type === t.toLowerCase()
                ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:bg-white/10 hover:text-white'
            }`}
          >
            {t === 'Lost' ? '🔍 I Lost Something' : '📦 I Found Something'}
          </button>
        ))}
      </motion.div>

      {/* Main Form */}
      <motion.form
        onSubmit={handleSubmit}
        variants={staggerItem}
        className="glass-panel border-white/10 p-5 space-y-6 bg-dark-panel/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Details + Description */}
          <div className="flex flex-col gap-6">
            {/* 1. Basic Details */}
            <div className="glass-card border-amber-500/25 p-5 space-y-4 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">Basic Details</p>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">Required</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider" htmlFor="item-title">Item Title</label>
                  <input
                    id="item-title"
                    type="text"
                    placeholder="What was lost/found? e.g., Blue Hydroflask"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className={`glass-input relative z-10 w-full transition-all py-2 ${errors.title ? 'border-red-500 bg-red-500/5' : 'focus:border-amber-500/60 focus:bg-white/10'}`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center justify-between" htmlFor="item-category">
                    Category
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  </label>
                  <select
                    id="item-category"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    className={`glass-input bg-transparent py-2 w-full hover:bg-white/5 transition-colors ${errors.category ? 'border-red-500 bg-red-500/5' : ''}`}
                  >
                    <option value="" disabled className="bg-slate-900">Select category...</option>
                    {mockCategories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider" htmlFor="item-datetime">Date & Time</label>
                  <input
                    id="item-datetime"
                    type="datetime-local"
                    value={form.date}
                    onChange={e => set('date', e.target.value)}
                    className={`glass-input py-2 w-full hover:bg-white/5 transition-colors [color-scheme:dark] ${errors.date ? 'border-red-500 bg-red-500/5' : ''}`}
                  />
                  {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
                </div>
              </div>
            </div>

            {/* 2. Description */}
            <div className="glass-card border-white/10 p-5 space-y-4 bg-white/5 flex-grow flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">Description</p>
                <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">Details</span>
              </div>
              <div className="space-y-1 flex-grow flex flex-col">
                <textarea
                  id="item-description"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Provide a detailed description of the item, noting any unique features, serial numbers, or identifying marks..."
                  className={`glass-input resize-none py-2 w-full flex-grow hover:bg-white/5 transition-colors ${errors.description ? 'border-red-500 bg-red-500/5' : 'focus:border-amber-500/60 focus:bg-white/10'}`}
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Right Column: Media + Location */}
          <div className="flex flex-col gap-6">
            {/* 3. Media Evidence */}
            <div className="glass-card border-amber-500/25 p-5 space-y-4 bg-amber-500/5 group hover:border-amber-500/40 transition-colors flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white">Media Evidence</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">
                    PNG, JPG, WEBP • Max 4MB • Up to 4 images
                  </p>
                </div>
                <div className="text-[10px] text-amber-400 font-mono flex gap-2">
                  <span>📸 AI Analysis</span>
                  <span>📝 OCR Scan</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="w-full flex flex-wrap gap-3">
                  <AnimatePresence>
                    {previews.map((preview, idx) => (
                      <motion.div 
                        key={preview}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative overflow-hidden rounded-lg border border-white/20 shadow-lg"
                      >
                        <img src={preview} alt={`Preview ${idx + 1}`} className="h-16 w-16 md:h-20 md:w-20 object-cover" />
                        
                        {idx === 0 && isScanning && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-10">
                            {/* Scanning laser effect */}
                            <div className="absolute left-0 w-full h-0.5 bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-scan-laser" />
                            {/* Scanning text overlay */}
                            <span className="text-[10px] font-bold text-amber-400 font-mono">{scanProgress}%</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 border border-white/20 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-colors shadow-md z-20"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {previews.length < 4 && (
                    <button
                      type="button"
                      id="choose-file-btn"
                      onClick={() => fileRef.current?.click()}
                      className="w-16 h-16 md:h-20 md:w-20 rounded-lg border-2 border-dashed border-white/15 flex flex-col items-center justify-center text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[9px] uppercase font-semibold">Add</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/png, image/jpeg, image/jpg, image/webp" multiple onChange={handleFile} className="hidden" />
              </div>

              {aiClassification && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border flex flex-col gap-3 relative overflow-hidden ${
                    aiClassification.category === 'Unable to detect'
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-amber-500/20 bg-amber-500/5'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 blur-[30px] pointer-events-none rounded-full ${
                    aiClassification.category === 'Unable to detect'
                      ? 'bg-red-500/10'
                      : 'bg-amber-500/10'
                  }`} />
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      aiClassification.category === 'Unable to detect' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        aiClassification.category === 'Unable to detect' ? 'bg-red-500' : 'bg-amber-400 animate-ping'
                      }`} />
                      YOLO/CNN Feature Extraction
                    </span>
                    {aiClassification.category !== 'Unable to detect' ? (
                      <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                        Confidence: {aiClassification.confidence}%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                        Unrecognized
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider">Suggested Title</span>
                      <span className={`font-medium ${aiClassification.category === 'Unable to detect' ? 'text-white/60 italic' : 'text-white'}`}>
                        {aiClassification.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider">Detected Category</span>
                      <span className={`font-medium ${aiClassification.category === 'Unable to detect' ? 'text-red-400 font-semibold' : 'text-white'}`}>
                        {aiClassification.category}
                      </span>
                    </div>
                  </div>

                  {aiClassification.tags && aiClassification.tags.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-white/40 block text-[9px] uppercase tracking-wider">Extracted AI Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiClassification.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md text-white/70">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* 4. Location Picker */}
            <div className="glass-card border-white/10 p-5 space-y-4 bg-white/5">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <p className="text-sm font-bold text-white">Campus Location</p>
                   <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase">Pin</span>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setShowEnlargedMap(true)}
                  className="text-xs text-amber-400 font-semibold border border-amber-500/30 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                 >
                   Enlarge Map ↗
                 </button>
              </div>
              <div className="rounded-lg overflow-hidden border border-white/10">
                <LocationPicker
                  value={form.location}
                  onChange={(loc) => set('location', loc)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <motion.button
            type="submit"
            id="submit-report-btn"
            disabled={isLoading}
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold
              hover:bg-amber-400 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.35)] relative overflow-hidden flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Report</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>

      {/* Info Card */}
      <motion.div
        variants={staggerItem}
        className="glass-card border-amber-500/30 p-4 text-xs text-white/70 leading-relaxed bg-amber-500/5 flex gap-3 items-start relative overflow-hidden"
      >
        <div className="p-2 bg-amber-500/10 rounded-full shrink-0">
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="z-10">
          <span className="text-amber-400 font-bold block mb-1">How it works:</span> 
          After submitting, our AI analyzes your report and automatically searches for possible matches. If a match is found, you'll receive a notification with a similarity score. All reports are registered on blockchain for verification.
        </div>
        {/* Subtle background glow */}
        <div className="absolute top-1/2 -right-10 w-32 h-32 bg-amber-500/20 blur-[50px] pointer-events-none rounded-full" />
      </motion.div>

      {/* Enlarged Map Overlay */}
      <AnimatePresence>
        {showEnlargedMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-panel border-amber-500/40 bg-dark-panel w-full max-w-4xl max-h-[80vh] flex flex-col relative"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Select Precise Location
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEnlargedMap(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4 flex-grow overflow-hidden">
                <div className="h-[50vh] md:h-[60vh] rounded-xl overflow-hidden border border-white/10">
                  <LocationPicker
                    value={form.location}
                    onChange={(loc) => set('location', loc)}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 text-right">
                <button
                  type="button"
                  onClick={() => setShowEnlargedMap(false)}
                  className="px-6 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/30 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <SuccessOverlay 
        isVisible={showSuccess} 
        message={`Your report for "${form.title}" has been submitted successfully. You will be notified of any matches shortly.`} 
      />
    </motion.div>
  );
}
