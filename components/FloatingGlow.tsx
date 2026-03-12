const blobs = [
  { color: 'bg-blue-500/20 dark:bg-blue-400/10', size: 'w-72 h-72', x: '-10%', y: '10%', duration: '18s' },
  { color: 'bg-cyan-400/20 dark:bg-cyan-400/10', size: 'w-96 h-96', x: '60%', y: '-10%', duration: '22s' },
  { color: 'bg-purple-500/15 dark:bg-purple-400/10', size: 'w-80 h-80', x: '30%', y: '60%', duration: '20s' },
]

const FloatingGlow = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <style>{`
        @keyframes float-0 {
          0%, 100% { translate: 0 0; }
          25% { translate: 40px -30px; }
          50% { translate: -30px 20px; }
          75% { translate: 20px -40px; }
        }
        @keyframes float-1 {
          0%, 100% { translate: 0 0; }
          25% { translate: -30px 20px; }
          50% { translate: 20px -40px; }
          75% { translate: 40px -30px; }
        }
        @keyframes float-2 {
          0%, 100% { translate: 0 0; }
          25% { translate: 20px -40px; }
          50% { translate: 40px -30px; }
          75% { translate: -30px 20px; }
        }
      `}</style>
      {blobs.map((blob, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl will-change-transform ${blob.color} ${blob.size}`}
          style={{
            left: blob.x,
            top: blob.y,
            animation: `float-${i} ${blob.duration} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

export default FloatingGlow
