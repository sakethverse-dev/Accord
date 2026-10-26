import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, FileCheck, RotateCcw, PenTool, Type, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SignatureModal = ({ isOpen, onClose, onSign, agreementTitle }) => {
  const { user } = useAuth();
  const [signerName, setSignerName] = useState(user?.name || '');
  const [affirmationChecked, setAffirmationChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync signerName whenever user profile updates or modal opens
  useEffect(() => {
    if (user?.name) {
      setSignerName(user.name);
    }
  }, [user?.name, isOpen]);

  // Tab: 'draw' | 'type'
  const [signMode, setSignMode] = useState('draw');

  // Font style for typed signature: 'caveat' | 'dancing' | 'serif'
  const [selectedFont, setSelectedFont] = useState('caveat');

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && signMode === 'draw') {
      const timer = setTimeout(() => {
        initCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, signMode]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    setHasDrawn(false);
  };

  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  // Convert typed name into a PNG data URL via off-screen canvas
  const generateTypedSignatureDataUrl = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Choose font family
    let fontFamily = "'Caveat', cursive";
    if (selectedFont === 'dancing') fontFamily = "'Dancing Script', cursive";
    if (selectedFont === 'serif') fontFamily = "'Georgia', serif";

    ctx.font = `64px ${fontFamily}`;
    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(signerName.trim(), canvas.width / 2, canvas.height / 2 + 5);

    return canvas.toDataURL('image/png');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!affirmationChecked || !signerName.trim()) return;

    setLoading(true);
    try {
      let signatureImage = '';
      if (signMode === 'draw' && canvasRef.current && hasDrawn) {
        signatureImage = canvasRef.current.toDataURL('image/png');
      } else {
        signatureImage = generateTypedSignatureDataUrl();
      }

      await onSign({
        signerName: signerName.trim(),
        affirmationChecked,
        signatureImage,
      });
      onClose();
    } catch (err) {
      alert(`Signature execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '620px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              background: 'var(--risk-safe-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--risk-safe-border)',
            }}>
              <FileCheck size={20} color="var(--risk-safe)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 800 }}>
                Digital Signature Execution
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Legally binding e-signature under IT Act 2000 (Sec 10A) & ESIGN Act
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          background: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
        }}>
          Executing: <strong style={{ color: 'var(--text-main)' }}>"{agreementTitle}"</strong>.
          Affixing your signature records your identity, IP address, timestamp, and applies the SHA-256 seal once counter-signed.
        </div>

        <form onSubmit={handleSubmit}>
          {/* Signer Legal Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Full Legal Signer Name
            </label>
            <input
              type="text"
              className="input-field"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Your Full Legal Name"
              required
              id="input-signer-name"
              style={{ fontSize: '0.95rem', fontWeight: 700 }}
            />
          </div>

          {/* Mode Switcher: Draw vs Type */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Signature Input Method
              </label>

              <div style={{
                display: 'flex',
                background: 'var(--bg-muted)',
                borderRadius: '6px',
                padding: '2px',
                border: '1px solid var(--border-subtle)',
              }}>
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: signMode === 'draw' ? '#ffffff' : 'transparent',
                    color: signMode === 'draw' ? '#000000' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <PenTool size={12} />
                  <span>Draw</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignMode('type')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    background: signMode === 'type' ? '#ffffff' : 'transparent',
                    color: signMode === 'type' ? '#000000' : 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Type size={12} />
                  <span>Type</span>
                </button>
              </div>
            </div>

            {/* DRAW MODE: Canvas Pad */}
            {signMode === 'draw' ? (
              <div style={{ position: 'relative' }}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.06)',
                  position: 'relative',
                  touchAction: 'none',
                }}>
                  {/* Subtle baseline line & X sign */}
                  <div style={{
                    position: 'absolute',
                    bottom: '28px',
                    left: '20px',
                    right: '20px',
                    borderBottom: '1px dashed #cbd5e1',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginRight: '8px', transform: 'translateY(-2px)' }}>✕</span>
                  </div>

                  <canvas
                    ref={canvasRef}
                    width={550}
                    height={140}
                    style={{ width: '100%', height: '140px', display: 'block', cursor: 'crosshair' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {hasDrawn ? 'Signature captured' : 'Use mouse or touch to draw your signature above'}
                  </span>
                  <button
                    type="button"
                    onClick={initCanvas}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RotateCcw size={11} />
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              /* TYPE MODE: Cursive Script Preview */
              <div>
                {/* Font Selection Pills */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFont('caveat')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: selectedFont === 'caveat' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: selectedFont === 'caveat' ? 'var(--accent-bg)' : 'var(--bg-muted)',
                      color: 'var(--text-main)',
                      fontFamily: "'Caveat', cursive",
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Caveat Script
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFont('dancing')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: selectedFont === 'dancing' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: selectedFont === 'dancing' ? 'var(--accent-bg)' : 'var(--bg-muted)',
                      color: 'var(--text-main)',
                      fontFamily: "'Dancing Script', cursive",
                      fontSize: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Dancing Script
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFont('serif')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '6px',
                      border: selectedFont === 'serif' ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                      background: selectedFont === 'serif' ? 'var(--accent-bg)' : 'var(--bg-muted)',
                      color: 'var(--text-main)',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      cursor: 'pointer',
                    }}
                  >
                    Formal Italic
                  </button>
                </div>

                {/* Live Preview Box */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.06)',
                  position: 'relative',
                  minHeight: '110px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '22px',
                    left: '20px',
                    right: '20px',
                    borderBottom: '1px dashed #cbd5e1',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, marginRight: '8px', transform: 'translateY(-2px)' }}>✕</span>
                  </div>

                  <span style={{
                    fontFamily: selectedFont === 'dancing' ? "'Dancing Script', cursive" : selectedFont === 'serif' ? "Georgia, serif" : "'Caveat', cursive",
                    fontStyle: selectedFont === 'serif' ? 'italic' : 'normal',
                    fontSize: '2.5rem',
                    color: '#0f172a',
                    zIndex: 2,
                    lineHeight: 1,
                  }}>
                    {signerName || 'Your Name'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Signer Meta Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginBottom: '14px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-muted)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <span>Signer Role: </span>
              <strong style={{ color: 'var(--text-main)', textTransform: 'capitalize' }}>{user?.role}</strong>
            </div>
            <div>
              <span>Verified Account: </span>
              <strong style={{ color: 'var(--text-main)' }}>{user?.email}</strong>
            </div>
          </div>

          {/* Mandatory Affirmation Checkbox */}
          <div style={{
            background: 'var(--risk-safe-bg)',
            border: '1px solid var(--risk-safe-border)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '18px',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="checkbox-legal-affirmation"
                checked={affirmationChecked}
                onChange={(e) => setAffirmationChecked(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--risk-safe)' }}
                required
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.45, fontWeight: 500 }}>
                I hereby affirm under the Information Technology Act, 2000 (Sec 10A) and Indian Contract Act, 1872 that I have reviewed the terms of this agreement and intend this electronic signature to be legally binding and effective.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-safe"
              disabled={loading || !affirmationChecked || !signerName.trim() || (signMode === 'draw' && !hasDrawn)}
              id="btn-confirm-sign"
            >
              <Lock size={14} />
              {loading ? 'Affixing Digital Seal...' : 'Execute Digital Signature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
