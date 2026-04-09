'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Client {
  id: number;
  name: string;
  platform: string;
  niche: string;
  posts: number;
  status: 'active' | 'inactive';
}

interface ClientContextType {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  activeClient: Client | null;
  setActiveClient: (client: Client | null) => void;
  addClient: (name: string) => void;
  deleteClient: (id: number) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: 'FreshBrew Teas', platform: 'Instagram', niche: 'Food & Beverage', posts: 45, status: 'active' },
    { id: 2, name: 'FitLife Gym', platform: 'LinkedIn', niche: 'Fitness', posts: 23, status: 'active' },
  ]);
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const addClient = (name: string) => {
    const newClient: Client = { 
      id: Date.now(), 
      name, 
      platform: 'Instagram', 
      niche: '', 
      posts: 0, 
      status: 'active' 
    };
    setClients([...clients, newClient]);
    setActiveClient(newClient);
  };

  const deleteClient = (id: number) => {
    setClients(clients.filter(c => c.id !== id));
    if (activeClient?.id === id) setActiveClient(null);
  };

  return (
    <ClientContext.Provider value={{ clients, activeClient, setClients, setActiveClient, addClient, deleteClient }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClients must be used within ClientProvider');
  return context;
}