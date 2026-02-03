import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { uploadImageToCloud } from '../utils/uploadImage';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { compressImage } from '../utils/imageCompressor';

const AddProduct = () => {
    const { store } = useStore();
    const navigate = useNavigate();
    const [mode, setMode] = useState('manual'); // manual, bulk, pdf
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Configure PDF.js worker
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        } catch (e) {
            console.error("Failed to configure PDF worker", e);
        }
    }, []);

    // Manual state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('');
    const [imageFile, setImageFile] = useState(null);

    // Bulk state
    const [bulkFiles, setBulkFiles] = useState([]);
    const [bulkPrice, setBulkPrice] = useState('');

    // PDF state
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfPrice, setPdfPrice] = useState('');
    const [pdfPreviews, setPdfPreviews] = useState([]);

    const [autoBoost, setAutoBoost] = useState(false);

    const getFinalPrice = (p) => {
        const base = parseFloat(p) || 0;
        return autoBoost ? base + 50 : base;
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) return alert("Please select an image");
        setLoading(true);
        try {
            const compressedBlob = await compressImage(imageFile, 800, 0.7);
            const url = await uploadImageToCloud(compressedBlob);

            await addDoc(collection(db, "products"), {
                storeId: store.id,
                name,
                price: getFinalPrice(price),
                description: desc,
                category: category.toLowerCase().trim(),
                image: url,
                createdAt: new Date().toISOString()
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (bulkFiles.length === 0) return alert("Select images");
        if (!bulkPrice) return alert("Set a price for all");
        setLoading(true);
        try {
            for (let i = 0; i < bulkFiles.length; i++) {
                const file = bulkFiles[i];
                const compressedBlob = await compressImage(file, 800, 0.7);
                const url = await uploadImageToCloud(compressedBlob);

                await addDoc(collection(db, "products"), {
                    storeId: store.id,
                    name: file.name.split('.')[0],
                    price: getFinalPrice(bulkPrice),
                    description: "",
                    image: url,
                    createdAt: new Date().toISOString()
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePdfChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPdfFile(file);
        setLoading(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const previews = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                previews.push(canvas.toDataURL('image/jpeg', 0.8));
            }
            setPdfPreviews(previews);
        } catch (err) {
            console.error("PDF Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePdfSubmit = async () => {
        if (pdfPreviews.length === 0) return;
        setLoading(true);
        try {
            for (let i = 0; i < pdfPreviews.length; i++) {
                const dataUrl = pdfPreviews[i];
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const url = await uploadImageToCloud(blob);

                await addDoc(collection(db, "products"), {
                    storeId: store.id,
                    name: `Catalog Item ${i + 1}`,
                    price: getFinalPrice(pdfPrice),
                    description: `Page ${i + 1} of ${pdfFile.name}`,
                    image: url,
                    createdAt: new Date().toISOString()
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeBulkFile = (index) => {
        setBulkFiles(bulkFiles.filter((_, i) => i !== index));
    };

    return (
        <div style={{ padding: '2rem 5%', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <h1 style={{ marginBottom: '2rem' }}>Add Products</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('manual')}><Upload size={18} /> Manual</button>
                <button className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('bulk')}><ImageIcon size={18} /> Bulk Images</button>
                <button className={`btn ${mode === 'pdf' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('pdf')}><FileText size={18} /> PDF Catalog</button>
            </div>

            <div className="glass glass-card">
                {mode === 'manual' && (
                    <form onSubmit={handleManualSubmit}>
                        <div className="input-group">
                            <label className="label">Product Name</label>
                            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="label">Price (₹)</label>
                            <input type="number" className="input" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="label">Category (e.g. Shirts, Pants)</label>
                            <input className="input" placeholder="e.g. Shirts" value={category} onChange={e => setCategory(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="label">Description</label>
                            <textarea className="input" rows="3" value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="label">Product Image</label>
                            <input type="file" className="input" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Uploading...' : 'Add Product'}
                        </button>
                    </form>
                )}

                {mode === 'bulk' && (
                    <div>
                        <div className="input-group">
                            <label className="label">Set Price for All (₹)</label>
                            <input type="number" className="input" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="label">Select Images</label>
                            <input type="file" className="input" multiple accept="image/*" onChange={e => setBulkFiles([...bulkFiles, ...Array.from(e.target.files)])} />
                        </div>

                        {bulkFiles.length > 0 && (
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0', marginBottom: '1.5rem', scrollSnapType: 'x mandatory' }}>
                                {bulkFiles.map((file, i) => (
                                    <div key={i} style={{ position: 'relative', minWidth: '120px', height: '120px', scrollSnapAlign: 'start' }}>
                                        <img src={URL.createObjectURL(file)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                        <button onClick={() => removeBulkFile(i)} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error)', border: 'none', borderRadius: '50%', color: 'white', padding: '4px', cursor: 'pointer' }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={handleBulkSubmit} className="btn btn-primary" style={{ width: '100%' }} disabled={loading || bulkFiles.length === 0}>
                            {loading ? 'Uploading Batch...' : `Upload ${bulkFiles.length} Products`}
                        </button>
                    </div>
                )}

                {mode === 'pdf' && (
                    <div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>Upload a PDF catalog. Each page will be converted into a product with the same price.</p>
                        <div className="input-group">
                            <label className="label">Price per Page (₹)</label>
                            <input type="number" className="input" value={pdfPrice} onChange={e => setPdfPrice(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="label">Select PDF</label>
                            <input type="file" className="input" accept="application/pdf" onChange={handlePdfChange} />
                        </div>

                        {pdfPreviews.length > 0 && (
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0', marginBottom: '1.5rem' }}>
                                {pdfPreviews.map((src, i) => (
                                    <div key={i} style={{ minWidth: '150px', border: '1px solid var(--surface-border)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={src} alt={`Page ${i + 1}`} style={{ width: '100%', height: '200px', objectFit: 'contain' }} />
                                        <div style={{ padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>Page {i + 1}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={handlePdfSubmit} className="btn btn-primary" style={{ width: '100%' }} disabled={loading || pdfPreviews.length === 0}>
                            {loading ? 'Processing PDF...' : `Import ${pdfPreviews.length} Products from PDF`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddProduct;
