import React, { useMemo, useState } from 'react';

function dataLocalISO(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

export default function TelaFinancas({ pedidos }) {
  const [dataFiltro, setDataFiltro] = useState(dataLocalISO(new Date()));

  const pedidosDoDia = useMemo(
    () => pedidos.filter(p => dataLocalISO(p.dataCriacao) === dataFiltro),
    [pedidos, dataFiltro]
  );

  const entregues = pedidosDoDia.filter(p => p.status === 'entregue');
  const emAndamento = pedidosDoDia.filter(p => p.status !== 'entregue');

  const totalEntregue = entregues.reduce((soma, p) => soma + (p.total || 0), 0);
  const totalEmAndamento = emAndamento.reduce((soma, p) => soma + (p.total || 0), 0);
  const totalGeral = totalEntregue + totalEmAndamento;
  const ticketMedio = pedidosDoDia.length > 0 ? totalGeral / pedidosDoDia.length : 0;

  return (
    <div>
      <h3>💰 Finanças</h3>

      <label style={{ display: 'block', marginBottom: 6 }}>Data</label>
      <input
        type="date"
        value={dataFiltro}
        onChange={e => setDataFiltro(e.target.value)}
        style={{ marginBottom: 16, padding: 8 }}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, color: '#555' }}>Total do dia (todos os pedidos)</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>R$ {totalGeral.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, color: '#555' }}>Já entregue / recebido</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>R$ {totalEntregue.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, color: '#555' }}>Em andamento</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>R$ {totalEmAndamento.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ fontSize: 14 }}>
          <strong>{pedidosDoDia.length}</strong> pedido(s) no dia
        </div>
        <div style={{ fontSize: 14 }}>
          Ticket médio: <strong>R$ {ticketMedio.toFixed(2)}</strong>
        </div>
      </div>

      <h4>Pedidos do dia</h4>
      {pedidosDoDia.length === 0 && <p style={{ color: '#666' }}>Nenhum pedido nesta data.</p>}
      {pedidosDoDia.slice().reverse().map(p => (
        <div key={p.id} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8
        }}>
          <div>
            <strong>{p.cliente}</strong>
            <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase' }}>{p.status}</div>
          </div>
          <div style={{ fontWeight: 700 }}>R$ {(p.total || 0).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
