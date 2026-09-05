import React, { useState, useEffect } from 'react';

const API_URL = 'https://hamburgueria-production-ea67.up.railway.app/api/config';

export default function TelaConfiguracoes({ config }) {
  const [taxa, setTaxa] = useState('0');

  useEffect(() => {
    setTaxa(String(config.taxaEntrega ?? 0));
  }, [config.taxaEntrega]);

  async function salvar(e) {
    e.preventDefault();
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taxaEntrega: taxa })
    });
    alert('Taxa de entrega atualizada!');
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h3>Configurações</h3>
      <form onSubmit={salvar}>
        <label style={{ display: 'block', marginBottom: 6 }}>Taxa de entrega (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={taxa}
          onChange={e => setTaxa(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10 }}
        />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
