import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TelaCaixa from './TelaCaixa.jsx';
import TelaCozinha from './TelaCozinha.jsx';
import TelaProdutos from './TelaProdutos.jsx';
import TelaConfiguracoes from './TelaConfiguracoes.jsx';
import TelaFinancas from './TelaFinancas.jsx';

const socket = io('https://hamburgueria-production-ea67.up.railway.app');

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [taxasEntrega, setTaxasEntrega] = useState([]);
  const [tela, setTela] = useState('caixa'); // 'caixa' | 'cozinha' | 'produtos' | 'config' | 'financas'

  useEffect(() => {
    socket.on('pedidos:atualizados', (novosPedidos) => setPedidos(novosPedidos));
    socket.on('produtos:atualizados', (novosProdutos) => setProdutos(novosProdutos));
    socket.on('taxas:atualizadas', (novasTaxas) => setTaxasEntrega(novasTaxas));
    return () => {
      socket.off('pedidos:atualizados');
      socket.off('produtos:atualizados');
      socket.off('taxas:atualizadas');
    };
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header>
        <h1>🔥 Duo Brasa</h1>
        <nav style={{ marginBottom: 16 }}>
          <button onClick={() => setTela('caixa')} disabled={tela === 'caixa'}>💳 Caixa</button>{' '}
          <button onClick={() => setTela('cozinha')} disabled={tela === 'cozinha'}>👨‍🍳 Cozinha</button>{' '}
          <button onClick={() => setTela('produtos')} disabled={tela === 'produtos'}>📋 Produtos</button>{' '}
          <button onClick={() => setTela('config')} disabled={tela === 'config'}>⚙️ Configurações</button>{' '}
          <button onClick={() => setTela('financas')} disabled={tela === 'financas'}>💰 Finanças</button>
        </nav>
      </header>

      {tela === 'caixa' && <TelaCaixa pedidos={pedidos} produtos={produtos} taxasEntrega={taxasEntrega} />}
      {tela === 'cozinha' && <TelaCozinha pedidos={pedidos} />}
      {tela === 'produtos' && <TelaProdutos produtos={produtos} />}
      {tela === 'config' && <TelaConfiguracoes taxasEntrega={taxasEntrega} />}
      {tela === 'financas' && <TelaFinancas pedidos={pedidos} />}
    </div>
  );
}
