import React, { useState, useMemo } from 'react';
import PedidoCard from './PedidoCard.jsx';

const API_URL = 'https://hamburgueria-production-ea67.up.railway.app/api/pedidos';

export default function TelaCaixa({ pedidos, produtos, taxasEntrega }) {
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [quantidades, setQuantidades] = useState({}); // { produtoId: qtd }
  const [taxaEntregaId, setTaxaEntregaId] = useState(''); // '' = retirada / sem entrega

  const taxaSelecionada = taxasEntrega.find(t => t.id === taxaEntregaId);
  const valorTaxa = taxaSelecionada ? taxaSelecionada.taxa : 0;

  const itensSelecionados = useMemo(() => {
    return produtos
      .filter(p => (quantidades[p.id] || 0) > 0)
      .map(p => ({ nome: p.nome, preco: p.preco, quantidade: quantidades[p.id] }));
  }, [produtos, quantidades]);

  const subtotal = useMemo(
    () => itensSelecionados.reduce((soma, i) => soma + i.preco * i.quantidade, 0),
    [itensSelecionados]
  );

  const total = subtotal + valorTaxa;

  function alterarQuantidade(produtoId, delta) {
    setQuantidades(prev => {
      const atual = prev[produtoId] || 0;
      const novo = Math.max(0, atual + delta);
      return { ...prev, [produtoId]: novo };
    });
  }

  async function criarPedido(e) {
    e.preventDefault();
    if (itensSelecionados.length === 0) {
      alert('Selecione ao menos um produto.');
      return;
    }
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente, telefone, endereco, itens: itensSelecionados, observacoes,
        taxaEntregaId: taxaEntregaId || null
      })
    });
    setCliente(''); setTelefone(''); setEndereco(''); setObservacoes(''); setQuantidades({}); setTaxaEntregaId('');
  }

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <form onSubmit={criarPedido} style={{ flex: 1, minWidth: 280 }}>
        <h3>Novo Pedido</h3>
        <input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} required style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
        <input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />

        <h4>Produtos</h4>
        {produtos.length === 0 && (
          <p style={{ color: '#666', fontSize: 13 }}>
            Nenhum produto cadastrado. Vá na aba "Produtos" para cadastrar o cardápio primeiro.
          </p>
        )}
        {produtos.map(p => (
          <div key={p.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginBottom: 6
          }}>
            <div>
              <strong>{p.nome}</strong>
              <div style={{ fontSize: 12, color: '#555' }}>R$ {p.preco.toFixed(2)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button type="button" onClick={() => alterarQuantidade(p.id, -1)}>-</button>
              <span>{quantidades[p.id] || 0}</span>
              <button type="button" onClick={() => alterarQuantidade(p.id, 1)}>+</button>
            </div>
          </div>
        ))}

        <textarea placeholder="Observações" value={observacoes} onChange={e => setObservacoes(e.target.value)} style={{ display: 'block', width: '100%', margin: '8px 0' }} />

        <label style={{ display: 'block', marginBottom: 4 }}>Entrega</label>
        <select
          value={taxaEntregaId}
          onChange={e => setTaxaEntregaId(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        >
          <option value="">Retirada no local (sem taxa)</option>
          {taxasEntrega.map(t => (
            <option key={t.id} value={t.id}>{t.bairro} — R$ {t.taxa.toFixed(2)}</option>
          ))}
        </select>
        {taxasEntrega.length === 0 && (
          <p style={{ color: '#666', fontSize: 12, marginTop: -6 }}>
            Nenhum bairro cadastrado. Cadastre em "⚙️ Configurações".
          </p>
        )}

        <div style={{ fontSize: 14, color: '#555' }}>Subtotal: R$ {subtotal.toFixed(2)}</div>
        <div style={{ fontSize: 18, fontWeight: 700, margin: '4px 0 10px' }}>
          Total: R$ {total.toFixed(2)}
        </div>

        <button type="submit">Criar Pedido</button>
      </form>

      <div style={{ flex: 1, minWidth: 280 }}>
        <h3>Pedidos ({pedidos.length})</h3>
        {pedidos.slice().reverse().map(p => <PedidoCard key={p.id} pedido={p} />)}
      </div>
    </div>
  );
}
