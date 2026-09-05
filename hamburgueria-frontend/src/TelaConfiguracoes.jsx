import React, { useState } from 'react';
import { apiFetch } from './api.js';

export default function TelaConfiguracoes({ taxasEntrega }) {
  const [bairro, setBairro] = useState('');
  const [taxa, setTaxa] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    if (editandoId) {
      await apiFetch(`/api/taxas-entrega/${editandoId}`, {
        method: 'PUT',
        body: JSON.stringify({ bairro, taxa })
      });
    } else {
      await apiFetch('/api/taxas-entrega', {
        method: 'POST',
        body: JSON.stringify({ bairro, taxa })
      });
    }
    setBairro(''); setTaxa(''); setEditandoId(null);
  }

  function editar(t) {
    setEditandoId(t.id);
    setBairro(t.bairro);
    setTaxa(String(t.taxa));
  }

  async function excluir(id) {
    if (!confirm('Excluir esta taxa de entrega?')) return;
    await apiFetch(`/api/taxas-entrega/${id}`, { method: 'DELETE' });
  }

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <form onSubmit={salvar} style={{ flex: 1, minWidth: 260 }}>
        <h3>{editandoId ? 'Editar Taxa de Entrega' : 'Nova Taxa de Entrega'}</h3>
        <input
          placeholder="Bairro / região"
          value={bairro}
          onChange={e => setBairro(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          placeholder="Taxa (ex: 8.00)"
          type="number"
          step="0.01"
          min="0"
          value={taxa}
          onChange={e => setTaxa(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <button type="submit">{editandoId ? 'Salvar alterações' : 'Adicionar'}</button>
        {editandoId && (
          <button
            type="button"
            onClick={() => { setEditandoId(null); setBairro(''); setTaxa(''); }}
            style={{ marginLeft: 8 }}
          >
            Cancelar
          </button>
        )}
      </form>

      <div style={{ flex: 1, minWidth: 260 }}>
        <h3>Bairros cadastrados ({taxasEntrega.length})</h3>
        {taxasEntrega.length === 0 && <p style={{ color: '#666' }}>Nenhuma taxa cadastrada ainda.</p>}
        {taxasEntrega.map(t => (
          <div key={t.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8
          }}>
            <div>
              <strong>{t.bairro}</strong>
              <div style={{ fontSize: 13, color: '#555' }}>R$ {t.taxa.toFixed(2)}</div>
            </div>
            <div>
              <button onClick={() => editar(t)}>Editar</button>{' '}
              <button onClick={() => excluir(t.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
