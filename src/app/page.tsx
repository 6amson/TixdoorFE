
export default function Home() {
  return (
    <main>
      <div style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to Tixdoor
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280',
          maxWidth: '600px'
        }}>
          Your greivances, easily tailored, easily resolved.
        </p>
      </div>
    </main>
  );
}