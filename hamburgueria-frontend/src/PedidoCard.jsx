import React from 'react';

const API_URL = 'https://hamburgueria-production-ea67.up.railway.app/api/pedidos';

const proximoStatus = {
  pendente: 'preparando',
  preparando: 'pronto',
  pronto: 'entregue'
};

const corStatus = {
  pendente: '#f59e0b',
  preparando: '#3b82f6',
  pronto: '#10b981',
  entregue: '#6b7280'
};

export default function PedidoCard({ pedido, mostrarAcao = true }) {
  async function avancarStatus() {
    const novo = proximoStatus[pedido.status];
    if (!novo) return;
    await fetch(`${API_URL}/${pedido.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novo })
    });
  }

  const itens = Array.isArray(pedido.itens) ? pedido.itens : [];

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
      borderLeft: `6px solid ${corStatus[pedido.status]}`
    }}>
      <strong>{pedido.cliente}</strong> — {pedido.telefone}
      <div style={{ fontSize: 13, color: '#555' }}>{pedido.endereco}</div>
      <ul style={{ margin: '6px 0' }}>
        {itens.map((item, i) => (
          <li key={i}>
            {typeof item === 'string'
              ? item
              : `${item.quantidade}x ${item.nome} — R$ ${(item.preco * item.quantidade).toFixed(2)}`}
          </li>
        ))}
      </ul>
      {pedido.observacoes && <div style={{ fontSize: 13 }}>Obs: {pedido.observacoes}</div>}
      {pedido.bairroEntrega && (
        <div style={{ fontSize: 13 }}>🛵 Entrega ({pedido.bairroEntrega}): R$ {(pedido.taxaEntrega || 0).toFixed(2)}</div>
      )}
      {typeof pedido.total === 'number' && (
        <div style={{ fontWeight: 700, marginTop: 4 }}>Total: R$ {pedido.total.toFixed(2)}</div>
      )}
      <div style={{ marginTop: 8, fontWeight: 600, textTransform: 'uppercase', fontSize: 12 }}>
        {pedido.status}
      </div>
      {mostrarAcao && proximoStatus[pedido.status] && (
        <button onClick={avancarStatus} style={{ marginTop: 8 }}>
          Avançar para "{proximoStatus[pedido.status]}"
        </button>
      )}
    </div>
  );
}
