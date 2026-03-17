export default function LoadingSpinner() {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'60vh', flexDirection:'column', gap:16
    }}>
      <div style={{
        width:36, height:36, borderRadius:'50%',
        border:'3px solid var(--line)',
        borderTopColor:'var(--accent)',
        animation:'spin 0.8s linear infinite'
      }} />
      <span style={{fontSize:13, color:'var(--muted)'}}>Loading data from Sheets…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
