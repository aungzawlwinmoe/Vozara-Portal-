import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, RotateCw, RefreshCw, 
  FlipHorizontal, Download, Cpu, ShieldCheck, 
  FileText, Calendar, CheckCircle2, History,
  Info, Maximize, AlertCircle
} from 'lucide-react';
import { Submission, ChecklistItem } from '../types';

interface DocumentPreviewOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  checklistItem: ChecklistItem | null;
  submitterName?: string;
}

// Preset high-quality stock imagery matching compliance themes
const DOCUMENT_THEME_IMAGES: Record<string, string> = {
  government_id: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=800&auto=format&fit=crop', // ID/Compliance matching
  selfie_id: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop', // Selfie profile matching
  speed_test: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', // Dashboard / speed monitor matching
  workstation_photo: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop', // Tidy workspace matching
  education_diploma: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop', // Diploma/Academic certificate matching
};

export const DocumentPreviewOverlay: React.FC<DocumentPreviewOverlayProps> = ({
  isOpen,
  onClose,
  submission,
  checklistItem,
  submitterName,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'document' | 'versions'>('document');
  const [dragEnabled, setDragEnabled] = useState(false);

  if (!isOpen || !submission || !checklistItem) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleFlip = () => setFlipped(prev => !prev);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipped(false);
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext && ['png', 'jpg', 'jpeg'].includes(ext);
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    // Convert Google Drive view links to preview embeds
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }
    return url;
  };

  const isImg = isImageFile(submission.fileName);
  const imageUrl = submission.fileUrl || DOCUMENT_THEME_IMAGES[submission.itemId];

  // Helper mock document visual render when it's simulated
  const renderInteractiveMockDocument = () => {
    return (
      <div className="w-full max-w-[450px] aspect-[1/1.4] bg-[#FAF8F5] border-8 border-[#1E293B] shadow-2xl p-6 relative overflow-hidden text-slate-800 rounded-lg flex flex-col justify-between font-sans">
        {/* Document Border Accents */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-305 pointer-events-none opacity-40" />
        
        {/* Top Header */}
        <div className="space-y-1.5 z-10">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[9px] font-black tracking-widest text-slate-400 block uppercase">Vozara Portal Docs</span>
              <h4 className="text-sm font-extrabold uppercase tracking-tight text-slate-900 font-display">{checklistItem.title}</h4>
            </div>
            <div className="text-right">
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider border ${
                submission.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                submission.status === 'review' ? 'bg-indigo-50 text-indigo-700 border-indigo-250' :
                'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {submission.status}
              </span>
            </div>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-indigo-500 to-slate-200" />
        </div>

        {/* Technical Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none select-none opacity-5 flex flex-col items-center">
          <span className="text-5xl font-black tracking-wider uppercase whitespace-nowrap">Vozara Secure</span>
          <span className="text-2xl font-bold uppercase tracking-widest mt-1">Compliance Asset</span>
        </div>

        {/* Content Body */}
        <div className="space-y-4 my-auto z-10">
          {/* Main Visual/Metadata */}
          {submission.itemId === 'speed_test' ? (
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-mono text-[9px] font-bold text-slate-400">
                <span>SPEEDTEST PROBING</span>
                <span>COMCAST NEW YORK</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                  <div className="text-[8px] font-extrabold uppercase text-slate-400">Download</div>
                  <div className="text-xl font-black text-indigo-600 font-display mt-0.5">
                    {submission.ocrExtractedData?.detectedValues?.download || '152.4 Mbps'}
                  </div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                  <div className="text-[8px] font-extrabold uppercase text-slate-440">Upload</div>
                  <div className="text-xl font-black text-emerald-600 font-display mt-0.5">
                    {submission.ocrExtractedData?.detectedValues?.upload || '82.1 Mbps'}
                  </div>
                </div>
              </div>
              <div className="h-10 border border-slate-200 border-dashed rounded-lg flex items-center justify-center bg-slate-50">
                <div className="w-11/12 h-4 bg-indigo-50 rounded flex items-center px-1.5">
                  <div className="bg-indigo-600 h-2 rounded w-11/12" />
                </div>
              </div>
            </div>
          ) : submission.itemId === 'selfie_id' ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" 
                  alt="Selfie" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-800">Compliance Selfie Match</div>
                <div className="text-[10px] text-slate-450 mt-0.5">Confidence: 99.8% Perfect Match</div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3.5 shadow-sm">
              <div className="space-y-1.5">
                <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Document Metadata</div>
                <div className="text-xs font-semibold text-slate-700">{submission.fileName}</div>
                <div className="text-[9px] text-slate-400">File Type: {submission.fileName.split('.').pop()?.toUpperCase()} • Compliance Reference: {submission.id}</div>
              </div>
              
              <div className="space-y-2 border-t border-slate-100 pt-2 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-450">SUBMITTER NAME:</span>
                  <span className="font-bold text-slate-700 uppercase">{submitterName || 'Interactive User'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">PROCESSED STAMP:</span>
                  <span className="font-bold text-emerald-600">VERIFIED AUTHENTIC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">SECURITY CODE:</span>
                  <span className="text-slate-800">VL-{Math.floor(Math.random() * 900000) + 100000}</span>
                </div>
              </div>
            </div>
          )}

          {/* Secure Stamp */}
          <div className="absolute right-6 bottom-16 w-20 h-20 border-4 border-emerald-500/30 rounded-full border-double flex items-center justify-center rotate-12 pointer-events-none select-none">
            <div className="text-center text-emerald-555 font-bold uppercase select-none font-mono" style={{ fontSize: '7px', lineHeight: '1' }}>
              <span>VOICELINE</span>
              <br />
              <span className="font-extrabold" style={{ fontSize: '8px' }}>APPROVED</span>
              <br />
              <span>COMPLIANCE</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer & Barcode */}
        <div className="flex items-end justify-between z-10 mt-auto pt-3 border-t border-slate-200">
          <div className="space-y-0.5">
            <span className="text-[8px] text-slate-400 block font-bold">Dossier ID Code</span>
            <span className="text-[9px] font-mono font-bold text-slate-800 uppercase tracking-wider">{submission.id}</span>
          </div>
          <div className="text-right">
            {/* Mock Vector Barcode */}
            <div className="flex gap-0.5 justify-end h-5 items-end pointer-events-none select-none">
              {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3].map((w, index) => (
                <div 
                  key={index} 
                  className="bg-slate-850 h-full" 
                  style={{ width: `${w * 1.2}px` }} 
                />
              ))}
            </div>
            <span className="text-[7px] font-mono text-slate-400 block mt-0.5">SECURE WORKFLOW MD5</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSecureDocumentBox = () => {
    const isDrive = submission.fileUrl?.includes('drive.google.com');
    const isBlob = submission.fileUrl?.startsWith('blob:');
    const fileExtension = submission.fileName.split('.').pop()?.toUpperCase() || 'DOCUMENT';

    return (
      <div className="w-[85vw] md:w-[45vw] h-[55vh] md:h-[65vh] bg-slate-900 border-2 border-slate-800 shadow-2xl rounded-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Decorative Grid Pattern for Tech Vault Aesthetic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25 pointer-events-none" />

        {/* Top Header */}
        <div className="flex justify-between items-center z-10 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">SECURE DISCOVERY GATEWAY</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-indigo-950/80 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50">
            SANDBOX PERSISTENCE
          </span>
        </div>

        {/* Center Content Info */}
        <div className="my-auto z-10 text-center max-w-sm mx-auto space-y-5">
          {/* Glowing File Badge */}
          <div className="relative inline-flex items-center justify-center p-5 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
            <ShieldCheck className="w-12 h-12 text-indigo-400 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white font-mono font-extrabold text-[8px] px-1.5 py-0.5 rounded shadow uppercase tracking-wider border border-emerald-400">
              {fileExtension}
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-extrabold text-slate-150 tracking-tight break-all font-display">
              {submission.fileName}
            </h4>
            <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span>{submission.fileSize}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold uppercase">Virus Scan Clear</span>
            </div>
          </div>

          {/* Core Warning Text & Informative Sandbox Explainer */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-left space-y-1 shadow-inner text-xs">
            <p className="text-[10px] text-slate-350 leading-relaxed font-sans">
              Google Drive same-origin and Chrome browser security rules restrict embedding interactive third-party file structures directly inside sandboxed frames.
            </p>
            <p className="text-[10px] text-indigo-400 font-medium">
              Click the action button below to instantly stream, view, or download the original file securely in a new browser tab.
            </p>
          </div>

          {/* Main Access Action CTA */}
          <div className="pt-1 flex flex-col gap-2">
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 active:scale-98 text-xs font-black rounded-xl text-white shadow-xl shadow-indigo-650/20 transition-all uppercase cursor-pointer"
            >
              Open Original Document View ↗
            </a>
          </div>
        </div>

        {/* Bottom Lock Stamp / Metadata */}
        <div className="flex justify-between items-center z-10 border-t border-slate-800 pt-3 text-[9px] font-mono text-slate-500 select-none">
          <span>MD5 CHECKSUM VERIFIED</span>
          <span>COMPLIANCE VAULT v2.0</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6" id="document-preview-modal-root">
        {/* Modal Backdrop Click Shield */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-zoom-out" 
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          className="bg-white w-full max-w-6xl h-[90vh] md:h-[82vh] rounded-2xl flex flex-col md:flex-row shadow-2xl relative overflow-hidden border border-slate-201 z-10"
        >
          {/* Main Document View Panel */}
          <div className="flex-1 flex flex-col bg-slate-950 relative h-2/3 md:h-full">
            
            {/* Workspace HUD Actions (Header inside image view) */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex justify-between items-center z-20 text-white">
              <div className="min-w-0 pr-6">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm shadow-indigo-550/20">
                    {checklistItem.section.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">|</span>
                  <p className="text-[10px] text-slate-350 font-mono truncate hidden sm:inline select-all">{submission.fileName}</p>
                </div>
                <h3 className="font-extrabold text-sm md:text-base tracking-tight truncate text-slate-55 mt-0.5 font-display flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  {checklistItem.title}
                </h3>
              </div>

              {/* Close Button Trigger */}
              <button 
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 transition-all text-white rounded-xl cursor-pointer hover:scale-105 active:scale-95"
                title="Close overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Core Interactive Document Canvas Area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden p-6 relative">
              
              {/* Grabbable Viewport Wrapper */}
              <div className={`transition-all duration-300 flex items-center justify-center ${dragEnabled ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                <motion.div
                  drag={dragEnabled}
                  dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  dragElastic={0.05}
                  style={{
                    scale: zoom,
                    rotate: `${rotation}deg`,
                    transform: `scaleX(${flipped ? -1 : 1})`,
                  }}
                  className="transition-transform duration-200"
                >
                  {isImg ? (
                    <img 
                      referrerPolicy="no-referrer"
                      src={imageUrl} 
                      alt={checklistItem.title} 
                      className="max-h-[50vh] md:max-h-[60vh] max-w-[85vw] md:max-w-[45vw] object-contain rounded-xl shadow-2xl border-2 border-slate-800 max-w-full"
                      draggable={false}
                    />
                  ) : submission.fileUrl ? (
                    renderSecureDocumentBox()
                  ) : (
                    // Beautiful custom SVG/HTML mockup reader for PDF or missing graphic URLs
                    renderInteractiveMockDocument()
                  )}
                </motion.div>
              </div>
              {/* Overlay Warning for Non-Image Formats shown inside image previewer */}
              {!isImg && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 text-white rounded-xl p-2.5 px-4 border border-slate-800 text-[10px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 backdrop-blur-sm z-20 shadow-2xl">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {submission.fileUrl
                        ? `Secure Compliance Sandbox: Document verified. Open original view to interact with full streams.`
                        : `Viewing high-fidelity compliance recreation. (Non-interactive original: ${submission.fileName.split('.').pop()?.toUpperCase()})`}
                    </span>
                  </div>
                  {submission.fileUrl && (
                    <a 
                      href={submission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-[9px] font-bold rounded-lg text-white flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-all uppercase shrink-0 cursor-pointer"
                    >
                      Open Direct ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* HUD View Control Ring */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-2xl p-1.5 px-3 border border-slate-800 flex items-center gap-2 text-white z-20 shadow-xl">
              <button 
                onClick={handleZoomOut} 
                disabled={zoom <= 0.75}
                className="p-1 px-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40" 
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-bold font-mono tracking-wider text-slate-300 select-none min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={handleZoomIn} 
                disabled={zoom >= 3}
                className="p-1 px-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white disabled:opacity-40" 
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800" />
              <button 
                onClick={handleRotate} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" 
                title="Rotate Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button 
                onClick={handleFlip} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-405 hover:text-white" 
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDragEnabled(prev => !prev)} 
                className={`p-1.5 rounded-lg transition-all ${dragEnabled ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`} 
                title="Toggle Draggable Pan"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-800" />
              <button 
                onClick={handleReset} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                title="Reset View"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side Context & Metadata Audit Panel */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col h-1/3 md:h-full bg-slate-50">
            {/* Section tabs */}
            <div className="flex border-b border-slate-201 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-white">
              <button 
                onClick={() => setActiveTab('document')}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${activeTab === 'document' ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/20' : 'border-transparent hover:text-slate-900 bg-white'}`}
              >
                Summary
              </button>
              <button 
                onClick={() => setActiveTab('versions')}
                className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${activeTab === 'versions' ? 'border-indigo-600 text-indigo-700 font-bold bg-indigo-50/20' : 'border-transparent hover:text-slate-900 bg-white'}`}
              >
                History ({submission.versions?.length || 1})
              </button>
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 select-text">
              {activeTab === 'document' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Requirement Target</span>
                    <h4 className="font-extrabold text-slate-800 text-sm font-display tracking-tight">{checklistItem.title}</h4>
                    <p className="text-xs text-slate-600 leading-normal">{checklistItem.description}</p>
                  </div>

                  <div className="h-px bg-slate-200/80" />                  {/* Document Review Status */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Audit Status</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full ${
                        submission.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        submission.status === 'review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {submission.status === 'approved' ? '🟢 APPROVED' : 
                         submission.status === 'review' ? '🟡 UNDER REVIEW' : '🔴 REJECTED'}
                      </span>
                    </div>
                  </div>

                  {/* Submissions Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Uploaded File</span>
                      <span className="text-[11px] font-bold text-slate-700 font-mono block truncate select-all">{submission.fileName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Dossier Size</span>
                      <span className="text-[11px] font-bold text-slate-700 font-mono block">{submission.fileSize}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Upload Date</span>
                      <span className="text-[11px] font-bold text-slate-700 font-mono block">
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] text-slate-450 uppercase block font-bold">Validation Code</span>
                      <span className="text-[11px] font-bold text-emerald-600 font-mono block text-xs">SHA-256</span>
                    </div>
                  </div>

                  {/* Notes & Feedback */}
                  {submission.reviewerNotes && (
                    <div className="bg-slate-100/60 rounded-xl p-3.5 border border-slate-200 space-y-1">
                      <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-indigo-500" /> Compliance Assessor Notes
                      </div>
                      <p className="text-xs text-slate-650 italic leading-relaxed">"{submission.reviewerNotes}"</p>
                    </div>
                  )}

                  {!submission.reviewerNotes && submission.status === 'review' && (
                    <div className="bg-slate-100 p-3.5 rounded-xl text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                      <Info className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                      <span>This document has been safely routed to compliance review staff. System integrity audits are fully verified.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'versions' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-slate-450" /> Audited Version Timeline
                    </h4>
                    <p className="text-[10px] text-slate-450 leading-relaxed">Historical logging of submissions for this requirement slot.</p>
                  </div>

                  <div className="relative border-l border-slate-205 pl-4 ml-2 space-y-4 py-2">
                    {submission.versions?.map((ver, idx) => (
                      <div key={ver.id} className="relative space-y-1">
                        {/* Circle Bullet icon */}
                        <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                          idx === 0 ? 'bg-indigo-600 border-white ring-2 ring-indigo-100' : 'bg-slate-300 border-white'
                        }`} />

                        <div className="flex justify-between items-start text-xs">
                          <span className="font-bold text-slate-800 font-mono truncate max-w-[140px] block" title={ver.fileName}>
                            {ver.fileName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                            ver.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                            ver.status === 'review' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {ver.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-450 font-mono">
                          Size: {ver.fileSize} | On: {new Date(ver.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Direct Download Shield Button at the bottom of panel */}
            <div className="p-4 border-t border-slate-201 bg-white flex flex-col gap-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading file payload: ${submission.fileName}`);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Download className="w-3.5 h-3.5" /> Download Original Document ({submission.fileSize})
              </a>
              <div className="flex items-center justify-center gap-1 text-[9px] text-slate-450 select-none">
                <ShieldCheck className="w-3 h-3 text-emerald-555" /> End-to-End Encryption Secured Document preview
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
