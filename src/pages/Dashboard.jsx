import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, setDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { uploadImageToCloud } from '../utils/uploadImage';
import { Plus, Settings, LogOut, Copy, ExternalLink, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { compressImage } from '../utils/imageCompressor';

const Dashboard = () => {
    const { store, setStore, loading, refreshStore } = useStore();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [storeName, setStoreName] = useState('');
    const [storeHandle, setStoreHandle] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [themeColor, setThemeColor] = useState('#6366f1');
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        if (store) {
            fetchProducts();
            setStoreName(store.name || '');
            setStoreHandle(store.handle || '');
            setStoreDescription(store.description || '');
            setWhatsapp(store.whatsapp || '');
            setThemeColor(store.themeColor || '#6366f1');
        }
    }, [store]);

    useEffect(() => {
        document.documentElement.style.setProperty('--primary', themeColor);
    }, [themeColor]);

    const fetchProducts = async () => {
        const q = query(collection(db, "products"), where("storeId", "==", store.id));
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleFileUpload = async (file) => {
        if (!file) return null;
        const compressedBlob = await compressImage(file, 400, 0.8);
        return await uploadImageToCloud(compressedBlob);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let logoUrl = store?.logo || null;
            if (logoFile) {
                logoUrl = await handleFileUpload(logoFile);
            }

            const storeData = {
                name: storeName,
                handle: storeHandle.toLowerCase().replace(/\s+/g, '-'),
                description: storeDescription,
                whatsapp: whatsapp,
                themeColor: themeColor,
                logo: logoUrl,
                ownerId: user.uid,
                updatedAt: new Date().toISOString()
            };

            if (store?.id) {
                await setDoc(doc(db, "stores", store.id), storeData, { merge: true });
                setStore({ ...store, ...storeData });
            } else {
                const docRef = await addDoc(collection(db, "stores"), { ...storeData, createdAt: new Date().toISOString() });
                setStore({ id: docRef.id, ...storeData });
            }

            setIsSettingUp(false);
            setIsEditingSettings(false);
            document.documentElement.style.setProperty('--primary', themeColor);
        } catch (error) {
            console.error("Error saving store:", error);
            alert("Error saving settings");
        } finally {
            setUploading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Delete this product?")) {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        }
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/');
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    if (!store && !isSettingUp) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <ShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h3>No store found</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>You haven't created a store yet. Let's set it up!</p>
                    <button onClick={() => setIsSettingUp(true)} className="btn btn-primary">Create Your Store</button>
                </div>
            </div>
        );
    }

    if (isSettingUp || isEditingSettings) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <form onSubmit={handleSubmit} className="glass glass-card" style={{ width: '100%', maxWidth: '500px' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Store Settings</h2>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="glass" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {(logoFile || store?.logo) ? (
                                    <img src={logoFile ? URL.createObjectURL(logoFile) : store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" />
                                ) : (
                                    <ShoppingBag color="var(--text-muted)" />
                                )}
                            </div>
                            <label className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                                Change Logo
                                <input type="file" hidden accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="label">Store Name</label>
                        <input className="input" placeholder="e.g. My Awesome Shop" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Unique Store Handle (URL name)</label>
                        <input className="input" placeholder="e.g. footballhouse" value={storeHandle} onChange={(e) => setStoreHandle(e.target.value)} required />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>This will be your link: ministore.com/s/{storeHandle || 'your-handle'}</span>
                    </div>
                    <div className="input-group">
                        <label className="label">Store Description (Short)</label>
                        <textarea className="input" placeholder="e.g. Handmade jewelry and accessories" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} rows="2" />
                    </div>
                    <div className="input-group">
                        <label className="label">WhatsApp Number (with country code)</label>
                        <input className="input" placeholder="e.g. 919876543210" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label className="label">Theme Color</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="color" className="input" style={{ width: '60px', height: '40px', padding: '2px' }} value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{themeColor}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploading}>
                            {uploading ? 'Saving...' : 'Save Settings'}
                        </button>
                        <button type="button" onClick={() => { setIsSettingUp(false); setIsEditingSettings(false); }} className="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    const prettyHandle = store.handle || store.id;
    const storeUrl = window.location.origin + "/#/s/" + prettyHandle;

    return (
        <div style={{ padding: '2rem 5%' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {store.logo && (
                        <img src={store.logo} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} alt="Store Logo" />
                    )}
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{store.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '20px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{storeUrl}</span>
                            <button onClick={() => { navigator.clipboard.writeText(storeUrl); alert('Copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                <Copy size={12} color="var(--text-muted)" />
                            </button>
                            <a href={storeUrl} target="_blank" rel="noreferrer" style={{ display: 'flex' }}>
                                <ExternalLink size={12} color="var(--primary)" />
                            </a>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setIsEditingSettings(true)} className="btn btn-secondary">
                        <Settings size={18} /> Settings
                    </button>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <section style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Your Products</h2>
                    <Link to="/dashboard/add" className="btn btn-primary">
                        <Plus size={18} /> Add Product
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="glass glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No products yet. Start adding items to your store.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {products.map(product => (
                            <div key={product.id} className="glass glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.1rem' }}>{product.name}</h3>
                                        {product.category && (
                                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                {product.category}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{product.price}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => deleteProduct(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
