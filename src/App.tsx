function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="rounded-2xl bg-slate-800 p-10 shadow-2xl border border-slate-700 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-400">
          Your Taildwind is Active!
        </h1>
        <p className="mt-4 text-slate-400">
          Backend sudah rapi, Frontend sudah siap tempur.
        </p>
        <button 
          className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-bold transition-all shadow-lg shadow-blue-500/20"
          onClick={() => alert('Siappp lanjut koding!')}
        >
          Gas Lanjut?
        </button>
      </div>
    </div>
  )
}

export default App