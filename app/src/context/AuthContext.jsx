import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [client, setClient] = useState(() => {
        try {
            const stored = localStorage.getItem('client');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const signIn = (clientData) => {
        localStorage.setItem('client', JSON.stringify(clientData));
        setClient(clientData);
    };

    const signOut = () => {
        localStorage.removeItem('client');
        setClient(null);
    };

    return (
        <AuthContext.Provider value={{ client, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
