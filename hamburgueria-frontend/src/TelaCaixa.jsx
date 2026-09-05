import React, { useState } from 'react';
import PedidoCard from './PedidoCard.jsx';

const API_URL = 'https://hamburgueria-production-ea67.up.railway.app/api/pedidos';

export default function TelaCaixa({ pedidos }) {
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [itensTexto, setItensTexto] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function criarPedido(e) {
    e.preventDefault();
    const itens = itensTexto.split(',').map(i => i.trim()).filter(Boolean);
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente, telefone, endereco, itens, observacoes })
    });
    setCliente(''); setTelefone(''); setEndereco(''); setItensTexto(''); setObservacoes('');
  }

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <form onSubmit={criarPedido} style={{ flex: 1, minWidth: 280 }}>
        <h3>Novo Pedido</h3>
        <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Itens (separados por vírgula)" value={itensTexto} onChange={e => setItensTexto(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <textarea placeholder="Observações" value={observacoes} onChange={e => setObservacoes(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <button type="submit">Criar Pedido</button>
      </form>

      <div style={{ flex: 1, minWidth: 280 }}>
        <h3>Pedidos ({pedidos.length})</h3>
        {pedidos.slice().reverse().map(p => <PedidoCard key={p.id} pedido={p} />)}
      </div>
    </div>
  );
}
