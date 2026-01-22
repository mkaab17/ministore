import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStore = async () => {
        if (!user) {
            setStore(null);
            setLoading(false);
            return;
        }

        try {
            // Find store where ownerId == user.uid
            const q = query(collection(db, "stores"), where("ownerId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setStore({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
            } else {
                setStore(null);
            }
        } catch (error) {
            console.error("Error fetching store:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStore();
    }, [user]);

    return (
        <StoreContext.Provider value={{ store, setStore, loading, refreshStore: fetchStore }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
