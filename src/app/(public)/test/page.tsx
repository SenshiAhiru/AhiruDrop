"use client";

import { useState } from "react";
import Link from "next/link";

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-20 space-y-4">
      <h1 className="text-2xl font-bold">Teste de Interatividade</h1>
      <p>Contador: {count}</p>
      <button
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg"
      >
        Incrementar
      </button>
      <div className="space-x-4">
        <Link href="/" className="text-primary-500 underline">Home</Link>
        <Link href="/raffles" className="text-primary-500 underline">Rifas</Link>
        <Link href="/test" className="text-primary-500 underline">Test</Link>
      </div>
    </div>
  );
}
