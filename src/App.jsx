import { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('install');
  const [logs, setLogs] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [promptCategory, setPromptCategory] = useState('Coding - Python Expert');
  const [showGlmChat, setShowGlmChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'system', text: 'Server Status: Loading Loci AI model weights into VRAM... (This may take several minutes)' },
    { sender: 'system', text: 'Server Status: ONLINE (GPU Active)' },
    { sender: 'system', text: 'Type a message to chat with Loci AI...' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  
  const prompts = {
    "Coding - Python Expert": "System: You are an elite Python software engineer. You specialize in clean, modular, and heavily typed code.\n\nRules:\n- Write production-ready, highly optimized code.\n- Include comprehensive docstrings and type hints (PEP 484).\n- Never use conversational filler like 'Here is your code' or 'Hope this helps'.\n- Always explain your architectural decisions briefly in a comment block at the top.\n\nFormat: Return ONLY the raw code inside a markdown block.\n\nUser: [Insert your coding task here]",
    "Coding - Code Reviewer": "System: You are a strict, senior security researcher and code reviewer.\n\nRules:\n- Identify any security vulnerabilities, memory leaks, or race conditions.\n- Point out deviations from language-specific style guides (e.g., PEP 8).\n- Be ruthless but constructive. Do not sugarcoat flaws.\n- Propose the optimal fix for every issue identified.\n\nFormat: Provide a bulleted list of issues followed by a unified diff or the corrected code block.\n\nUser: [Insert code here]"
  };

  const handleInstall = () => {
    setIsInstalling(true);
    setLogs(["Starting Loci AI Cloud Provisioning..."]);
    
    let step = 0;
    const steps = [
      "Allocating GPU container...",
      "Cloning Loci AI repository...",
      "Setting up Python virtual environment...",
      "Installing PyTorch and dependencies...",
      "Provisioning successful! Your server is ready."
    ];
    
    const interval = setInterval(() => {
      if (step < steps.length) {
        setLogs(prev => [...prev, steps[step]]);
        step++;
      } else {
        clearInterval(interval);
        setIsInstalling(false);
      }
    }, 1000);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatHistory(prev => [...prev, { sender: 'user', text: chatInput }]);
    const userInput = chatInput;
    setChatInput('');

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setChatHistory(prev => [...prev, { sender: 'system', text: `Backend Error: ${data.error}` }]);
        return;
      }
      
      setChatHistory(prev => [...prev, { sender: 'glm', text: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'system', text: `Network Error: ${error.message}` }]);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const renderInstallTab = () => (
    <div className="tab-content">
      <h2>Provision Server</h2>
      <p>Deploy your dedicated Loci AI environment to our secure cloud. This will allocate an instance for you.</p>
      
      <button 
        className="btn primary" 
        onClick={handleInstall}
        disabled={isInstalling}
      >
        {isInstalling ? 'Provisioning...' : 'One-Click Deploy'}
      </button>
      
      <div className="log-window">
        {logs.length === 0 && <span style={{color: '#64748b'}}>Logs will appear here...</span>}
        {logs.map((log, i) => <div key={i}>{'>'} {log}</div>)}
      </div>
    </div>
  );

  const renderPromptTab = () => (
    <div className="tab-content">
      <h2>Prompt Library</h2>
      <div className="form-group">
        <label>Select Domain & Task Type</label>
        <select 
          className="form-control" 
          value={promptCategory} 
          onChange={(e) => setPromptCategory(e.target.value)}
        >
          {Object.keys(prompts).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      
      <div className="prompt-display">
        {prompts[promptCategory].split('\n').map((line, i) => (
          <div key={i}>{line || <br />}</div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn success" onClick={() => navigator.clipboard.writeText(prompts[promptCategory])}>
          📋 Copy to Clipboard
        </button>
        <button className="btn primary" onClick={() => setShowGlmChat(true)}>
          🚀 Launch Loci AI CLI Server
        </button>
      </div>
    </div>
  );

  const renderMultiAgentTab = () => (
    <div className="tab-content">
      <h2>Multi-Agent Studio</h2>
      <p>Configure and orchestrate autonomous multi-agent swarms.</p>
      
      <div className="grid">
        <div>
          <div className="form-group">
            <label>Number of Agents</label>
            <input type="number" className="form-control" defaultValue="5" min="2" max="50" />
          </div>
          <div className="form-group">
            <label>Framework Backend</label>
            <select className="form-control">
              <option>LociaX Native Swarm</option>
              <option>AutoGen</option>
              <option>CrewAI</option>
            </select>
          </div>
        </div>
        <div>
          <div className="form-group">
            <label>Communication Topology</label>
            <select className="form-control">
              <option>Hierarchical</option>
              <option>Broadcast</option>
            </select>
          </div>
          <div className="form-group">
            <label>Reward Mechanism</label>
            <select className="form-control">
              <option>Loci AI (Self-Critique)</option>
              <option>Heuristic</option>
            </select>
          </div>
        </div>
      </div>
      
      <button className="btn warning" style={{width: '100%'}}>
        🚀 Initialize Swarm Training
      </button>
    </div>
  );

  return (
    <div className="app-container">
      <div className="header" style={{ position: 'relative' }}>
        <h1>LociaX OS</h1>
        <p>SaaS Cloud Edition</p>
        <button 
          className="btn primary" 
          style={{ position: 'absolute', top: '2rem', right: '2rem' }}
          onClick={() => setShowGlmChat(true)}
        >
          🚀 Launch AI Now
        </button>
      </div>
      
      <div className="tabs">
        <button className={`tab ${activeTab === 'install' ? 'active' : ''}`} onClick={() => setActiveTab('install')}>Deploy</button>
        <button className={`tab ${activeTab === 'prompt' ? 'active' : ''}`} onClick={() => setActiveTab('prompt')}>Prompts</button>
        <button className={`tab ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>Studio</button>
      </div>
      
      {activeTab === 'install' && renderInstallTab()}
      {activeTab === 'prompt' && renderPromptTab()}
      {activeTab === 'agent' && renderMultiAgentTab()}

      {/* Loci AI Chat Modal */}
      {showGlmChat && (
        <div className="modal-overlay">
          <div className="chat-modal">
            <div className="chat-header">
              <h3>LOCIAX OS - Loci AI INTERACTIVE CLI</h3>
              <button className="close-btn" onClick={() => setShowGlmChat(false)}>✕</button>
            </div>
            <div className="chat-window">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  <span className="sender-tag">
                    {msg.sender === 'user' ? 'User > ' : msg.sender === 'glm' ? 'Loci AI > ' : ''}
                  </span>
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSubmit} className="chat-input-form">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                autoFocus
              />
              <button type="submit" className="btn primary">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

