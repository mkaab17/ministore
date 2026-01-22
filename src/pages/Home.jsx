import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Smartphone, Globe, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "stores"));
                setStores(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Error fetching stores:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="glass" style={{ padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        <ShoppingBag color="#6366f1" /> miniStore
                    </h2>
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Seller Login</Link>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Create Your Store</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header style={{ padding: '80px 5% 40px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}
                >
                    Discover & Shop from <span style={{ color: '#6366f1' }}>Local miniStores</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}
                >
                    The easiest way for small businesses to sell directly on WhatsApp. No complex checkouts, just real conversations.
                </motion.p>
            </header>

            {/* Stores Section (Discover) */}
            <section style={{ padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.75rem' }}>Explore Stores</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{stores.length} stores active</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading stores...</div>
                ) : stores.length === 0 ? (
                    <div className="glass glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No stores have been created yet. Be the first!</p>
                        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Create My Store</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {stores.map(store => (
                            <StoreCard key={store.id} store={store} />
                        ))}
                    </div>
                )}
            </section>

            {/* How it Works section for sellers */}
            <section id="features" style={{ padding: '80px 5%', background: 'rgba(255,255,255,0.02)', marginTop: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Why sell with miniStore?</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Built for the modern mobile entrepreneur.</p>
                </div>
                <div className="grid grid-cols-2" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <FeatureCard
                        icon={<Smartphone color="#6366f1" />}
                        title="Mobile First"
                        desc="Optimized for phone screens to give your customers the best shopping experience."
                    />
                    <FeatureCard
                        icon={<MessageCircle color="#22c55e" />}
                        title="WhatsApp Orders"
                        desc="Get order details directly on your WhatsApp. No intermediaries, no fees."
                    />
                    <FeatureCard
                        icon={<Zap color="#f59e0b" />}
                        title="Fast Setup"
                        desc="Launch your store in under 2 minutes with simple, intuitive tools."
                    />
                    <FeatureCard
                        icon={<Globe color="#ec4899" />}
                        title="Public Directory"
                        desc="Every store is automatically listed here for anyone in the world to find and shop."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '40px 5%', textAlign: 'center', borderTop: '1px solid var(--surface-border)', marginTop: '4rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>&copy; 2026 miniStore. Simple Commerce for Everyone.</p>
            </footer>
        </div>
    );
};

const StoreCard = ({ store }) => (
    <motion.div
        whileHover={{ y: -5, borderColor: store.themeColor || '#6366f1' }}
        className="glass glass-card"
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid transparent', transition: 'border-color 0.3s ease' }}
    >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '14px', background: `${store.themeColor || '#6366f1'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${store.themeColor || '#6366f1'}44` }}>
                {store.logo ? (
                    <img src={store.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={store.name} />
                ) : (
                    <ShoppingBag color={store.themeColor || '#6366f1'} size={32} />
                )}
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{store.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                    @{store.id}
                </span>
            </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '2.7em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {store.description || "Everything you need, just a text away. Browse our products and order instantly!"}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open for orders</span>
            </div>
            <Link to={`/s/${store.id}`} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem', background: store.themeColor || '#6366f1', gap: '0.5rem' }}>
                View Store <ArrowRight size={16} />
            </Link>
        </div>
    </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
        className="glass glass-card"
    >
        <div style={{ marginBottom: '1rem' }}>{icon}</div>
        <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{desc}</p>
    </motion.div>
);

export default Home;
