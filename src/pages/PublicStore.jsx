import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ShoppingBag, MessageCircle, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicStore = () => {
    const { storeId } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchStoreData();
    }, [storeId]);

    const fetchStoreData = async () => {
        try {
            // First try fetching by ID
            let storeDoc = await getDoc(doc(db, "stores", storeId));
            let data = null;
            let actualId = storeId;

            if (storeDoc.exists()) {
                data = storeDoc.data();
            } else {
                // If not found by ID, try fetching by handle
                const q = query(collection(db, "stores"), where("handle", "==", storeId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    storeDoc = querySnapshot.docs[0];
                    data = storeDoc.data();
                    actualId = storeDoc.id;
                }
            }

            if (data) {
                setStore({ id: actualId, ...data });
                // Set dynamic theme color
                document.documentElement.style.setProperty('--primary', data.themeColor || '#6366f1');

                const pq = query(collection(db, "products"), where("storeId", "==", actualId));
                const querySnapshot = await getDocs(pq);
                setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = (product) => {
        const message = `Hi ${store.name}, I want to order:\n\n*${product.name}*\nPrice: ₹${product.price}\n\nLink: ${window.location.href}`;
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `https://wa.me/${store.whatsapp}?text=${encodedMessage}`;
    };

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Store...</div>;
    if (!store) return <div style={{ padding: '2rem', textAlign: 'center' }}>Store not found</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Store Header */}
            <header className="glass" style={{ padding: '1rem 5%', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {store.logo ? (
                            <img src={store.logo} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} alt="Logo" />
                        ) : (
                            <ShoppingBag size={24} color="var(--primary)" />
                        )}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{store.name}</span>
                    </h1>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search catalog..."
                            style={{ paddingLeft: '2.5rem', borderRadius: '20px', fontSize: '0.875rem', height: '36px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Hero / Banner */}
            <div style={{ background: `linear-gradient(135deg, ${store.themeColor}33, transparent)`, padding: '4rem 5%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                {store.logo && (
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={store.logo}
                        style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                        alt="Store Logo"
                    />
                )}
                <div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome to {store.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Browse our catalog and order directly on WhatsApp</p>
                </div>
            </div>

            {/* Categories */}
            {categories.length > 1 && (
                <div style={{ padding: '1rem 5%', display: 'flex', gap: '0.75rem', overflowX: 'auto', maxWidth: '1200px', margin: '0 auto', scrollbarWidth: 'none' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                padding: '0.5rem 1.25rem',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                                textTransform: 'capitalize'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            <main style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
                {filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        No products found matching your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                        <AnimatePresence>
                            {filteredProducts.map(product => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={product.id}
                                    className="glass glass-card"
                                    style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem', gap: '0.75rem' }}
                                >
                                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', aspectRatio: '1/1' }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                                        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>₹{product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleOrder(product)}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem', background: '#22c55e' }}
                                    >
                                        <MessageCircle size={16} /> Order
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Floating Call Button */}
            <a
                href={`https://wa.me/${store.whatsapp}`}
                style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#22c55e', color: 'white', padding: '1rem', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', zIndex: 1000 }}
            >
                <MessageCircle size={24} />
            </a>
        </div>
    );
};

export default PublicStore;
