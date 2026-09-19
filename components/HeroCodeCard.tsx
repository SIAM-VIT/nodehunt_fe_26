export function HeroCodeCard() {
  return (
    <div className="hero-card" aria-label="developer preview card">
      <span className="floating-symbol s1">{`{ left: "N02" }`}</span>
      <span className="floating-symbol s2">route.unlock()</span>
      <span className="floating-symbol s3">[D,C,Q,R]</span>
      <div className="terminal-bar">
        <div className="dots"><span /><span /><span /></div>
        <span>nodehunt/event.graph</span>
      </div>
      <div className="code-window">
        <div><b>const</b> current = <span className="yellow">&quot;N01&quot;</span>;</div>
        <div><b>if</b> (answer.correct) score += <span className="green">30</span>;</div>
        <div><b>else if</b> (attempts === 3) score += <span className="red">0</span>;</div>
        <div>&nbsp;</div>
        <div><b>unlock</b>({`{`}</div>
        <div>&nbsp;&nbsp;left: {`{`} type: <span className="yellow">&quot;R&quot;</span>, difficulty: <span className="red">&quot;hard&quot;</span> {`}`},</div>
        <div>&nbsp;&nbsp;right: {`{`} type: <span className="yellow">&quot;Q&quot;</span>, difficulty: <span className="yellow">&quot;medium&quot;</span> {`}`}</div>
        <div>{`});`}</div>
      </div>
    </div>
  );
}
