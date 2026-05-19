import { ArrowLeft, LogOut, Settings } from 'lucide-react';

interface AdminTopbarProps {
  isAuthenticated: boolean;
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ isAuthenticated, onBackToStore, onLogout }) => (
  <header className="admin-topbar">
    <div className="admin-topbar-left">
      <button onClick={onBackToStore} className="btn-secondary btn-back">
        <ArrowLeft size={16} /> Voltar para a Loja
      </button>
      <h2>
        <Settings size={22} /> Painel Administrativo DoLe Arte
      </h2>
    </div>

    {isAuthenticated && (
      <div className="admin-topbar-right">
        <button onClick={onLogout} className="btn-secondary btn-logout">
          <LogOut size={16} /> Sair
        </button>
      </div>
    )}
  </header>
);
