import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TelaCaixa from './TelaCaixa.jsx';
import TelaCozinha from './TelaCozinha.jsx';

// ⚠️ Ao publicar (deploy), troque pela URL do backend no Railway,
// ex: const socket = io('https://seu-projeto-production-xxxx.railway.app');
const socket = io('https://hamburgueria-production-ea67.up.railway.app');

export default function App() {
  const [pedidos, setPedidos] = useState([]);
  const [tela, setTela] = useState('caixa'); // 'caixa' | 'cozinha'

  useEffect(() => {
    socket.on('pedidos:atualizados', (novosPedidos) => setPedidos(novosPedidos));
    return () => socket.off('pedidos:atualizados');
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <header>
        <h1>🍔 Hamburgueria</h1>
        <nav style={{ marginBottom: 16 }}>
          <button onClick={() => setTela('caixa')} disabled={tela === 'caixa'}>💳 Caixa</button>{' '}
          <button onClick={() => setTela('cozinha')} disabled={tela === 'cozinha'}>👨‍🍳 Cozinha</button>
        </nav>
      </header>

      {tela === 'caixa' ? <TelaCaixa pedidos={pedidos} /> : <TelaCozinha pedidos={pedidos} />}
    </div>
  );
}
