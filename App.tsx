import React, { useState } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import { ToneOption } from './types';

function App() {
  const [tone, setTone] = useState<ToneOption>(ToneOption.Professional);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header currentTone={tone} onToneChange={setTone} />
      <main className="flex-1 flex overflow-hidden">
        <Editor tone={tone} />
      </main>
    </div>
  );
}

export default App;
