import { Save } from 'lucide-react';
import type { StoreSettings } from '../../types';

interface SettingsAdminProps {
  isLoading: boolean;
  settings: StoreSettings;
  onChange: (settings: StoreSettings) => void;
  onSave: (event: React.FormEvent) => void;
}

export const SettingsAdmin: React.FC<SettingsAdminProps> = ({ isLoading, settings, onChange, onSave }) => (
  <form onSubmit={onSave}>
    <div className="form-header mb-16">
      <h3>Configuracoes Gerais do Site</h3>
    </div>
    <p className="settings-desc">
      Ajuste o numero do WhatsApp de atendimento e os textos apresentados nas paginas da loja.
    </p>

    <div className="form-grid">
      <div className="form-group">
        <label>Nome da Loja</label>
        <input
          type="text"
          required
          value={settings.storeName}
          onChange={(event) => onChange({ ...settings, storeName: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>WhatsApp de Atendimento (DDD + Numero)</label>
        <input
          type="text"
          required
          value={settings.whatsappNumber}
          onChange={(event) => onChange({ ...settings, whatsappNumber: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group full-width">
        <label>URL do Instagram</label>
        <input
          type="url"
          required
          pattern="https://(www\.)?instagram\.com/.*"
          value={settings.instagramUrl}
          onChange={(event) => onChange({ ...settings, instagramUrl: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group full-width">
        <label>Titulo Principal do Banner</label>
        <input
          type="text"
          required
          value={settings.heroTitle}
          onChange={(event) => onChange({ ...settings, heroTitle: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group full-width">
        <label>Subtitulo Principal do Banner</label>
        <textarea
          required
          rows={3}
          value={settings.heroSubtitle}
          onChange={(event) => onChange({ ...settings, heroSubtitle: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group full-width">
        <label>Historia da Marca</label>
        <textarea
          required
          rows={5}
          value={settings.aboutText}
          onChange={(event) => onChange({ ...settings, aboutText: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>E-mail de Contato</label>
        <input
          type="email"
          required
          value={settings.contactEmail}
          onChange={(event) => onChange({ ...settings, contactEmail: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label>Horarios de Atendimento</label>
        <input
          type="text"
          required
          value={settings.contactHours}
          onChange={(event) => onChange({ ...settings, contactHours: event.target.value })}
          className="form-control"
        />
      </div>

      <div className="form-submit-row">
        <button type="submit" disabled={isLoading} className="btn-primary btn-save-full">
          <Save size={22} /> {isLoading ? 'Salvando...' : 'Salvar Configuracoes'}
        </button>
      </div>
    </div>
  </form>
);
