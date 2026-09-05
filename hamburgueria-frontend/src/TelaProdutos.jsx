import React, { useState } from 'react';
import { apiFetch } from './api.js';

export default function TelaProdutos({ produtos }) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  async function salvarProduto(e) {
    e.preventDefault();
    if (editandoId) {
      await apiFetch(`/api/produtos/${editandoId}`, {
        method: 'PUT',
        body: JSON.stringify({ nome, preco })
      });
    } else {
      await apiFetch('/api/produtos', {
        method: 'POST',
        body: JSON.stringify({ nome, preco })
      });
    }
    setNome(''); setPreco(''); setEditandoId(null);
  }

  function editar(produto) {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setPreco(String(produto.preco));
  }

  async function excluir(id) {
    if (!confirm('Excluir este produto?')) return;
    await apiFetch(`/api/produtos/${id}`, { method: 'DELETE' });
  }

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <form onSubmit={salvarProduto} style={{ flex: 1, minWidth: 260 }}>
        <h3>{editandoId ? 'Editar Produto' : 'Novo Produto'}</h3>
        <input
          placeholder="Nome do produto"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          placeholder="Preço (ex: 25.90)"
          type="number"
          step="0.01"
          min="0"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <button type="submit">{editandoId ? 'Salvar alterações' : 'Adicionar produto'}</button>
        {editandoId && (
          <button
            type="button"
            onClick={() => { setEditandoId(null); setNome(''); setPreco(''); }}
            style={{ marginLeft: 8 }}
          >
            Cancelar
          </button>
        )}
      </form>

      <div style={{ flex: 1, minWidth: 260 }}>
        <h3>Cardápio ({produtos.length})</h3>
        {produtos.length === 0 && <p style={{ color: '#666' }}>Nenhum produto cadastrado ainda.</p>}
        {produtos.map(p => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8
          }}>
            <div>
              <strong>{p.nome}</strong>
              <div style={{ fontSize: 13, color: '#555' }}>R$ {p.preco.toFixed(2)}</div>
            </div>
            <div>
              <button onClick={() => editar(p)}>Editar</button>{' '}
              <button onClick={() => excluir(p.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
