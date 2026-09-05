import React from 'react';
import PedidoCard from './PedidoCard.jsx';

export default function TelaCozinha({ pedidos }) {
  const ativos = pedidos.filter(p => p.status !== 'entregue');
  return (
    <div>
      <h3>Pedidos na Cozinha ({ativos.length})</h3>
      {ativos.map(p => <PedidoCard key={p.id} pedido={p} />)}
    </div>
  );
}
