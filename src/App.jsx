import { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('prompt');
  const [logs, setLogs] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);
  const [promptCategory, setPromptCategory] = useState('Writing - The Blog Generator');
  const [showGlmChat, setShowGlmChat] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'system', text: 'Server Status: Loading Loci AI model weights into VRAM... (This may take several minutes)' },
    { sender: 'system', text: 'Server Status: ONLINE (GPU Active)' },
    { sender: 'system', text: 'Type a message to chat with Loci AI...' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  
  const prompts = {
    "Writing - The Blog Generator": "Act as an expert copywriter. Write a 500-word blog post about the benefits of upgrading to a split system air conditioner before summer. Make the tone engaging, professional, and easy to read. Include a catchy title and a strong call-to-action at the end.",
    "Writing - Social Media Posts": "I need to post on Facebook and Instagram about a new commercial HVAC installation we just finished. Write 3 different short, punchy captions. Include relevant hashtags and emojis.",
    "Writing - Writer's Block Buster": "I am writing an 'About Us' page for my mechanical services business, but I'm stuck. Ask me 3 questions about my business, and when I answer them, write a professional 'About Us' bio for me.",
    "SEO - Web Optimizer": "I have a webpage about 'Ducted Air Conditioning in Perth'. Give me 5 highly clickable SEO title tags (under 60 characters) and 3 meta descriptions (under 160 characters) that will make people want to click on Google.",
    "Marketing - Ad Copywriter": "Write a short, high-converting Google Ads text for emergency air conditioning repair services. Focus on fast response times and 24/7 availability.",
    "Marketing - Website Layout Ideas": "I am building a new landing page for commercial refrigeration services. Outline the exact structure I should use from top to bottom (Hero section, Services, Testimonials, etc.) to maximize conversions.",
    "Professional - The Angry Customer Diffuser": "A customer sent me an angry email complaining that our technician was 30 minutes late due to traffic. Write a polite, de-escalating response apologizing for the delay but remaining professional and firm.",
    "Professional - Quote Follow-Up": "I sent a quote for a $15,000 commercial VRF installation 3 days ago and haven't heard back. Write a friendly, non-pushy follow-up email to check in and see if they have any questions.",
    "Editing - The Strict Editor": "Review the following text for spelling, grammar, and flow. Point out any errors and then provide a fully corrected version:\n\n[Paste text]",
    "Editing - Tone Adjustment": "Rewrite this email to sound more confident and persuasive, rather than passive and uncertain:\n\n[Paste text]"
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
    
    let count = parseInt(localStorage.getItem('loci_msg_count') || '0');
    let paid = localStorage.getItem('loci_has_paid') === 'true';

    if (count >= 5 && !paid) {
      setShowPaymentModal(true);
      return;
    }

    if (!paid) {
      localStorage.setItem('loci_msg_count', count + 1);
    }
    
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
        <button className={`tab ${activeTab === 'prompt' ? 'active' : ''}`} onClick={() => setActiveTab('prompt')}>Prompt Library</button>
      </div>
      
      {activeTab === 'prompt' && renderPromptTab()}

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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="chat-modal" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px' }}>
            <h2 style={{ color: '#ff4444' }}>Free Trial Ended</h2>
            <p>You have used your 5 free messages for this IP address.</p>
            <p>To continue using Loci AI, please purchase lifetime access for <strong>$39.99</strong>.</p>
            
            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" style={{ margin: '2rem 0' }}>
              <input type="hidden" name="cmd" value="_xclick" />
              <input type="hidden" name="business" value="jtechsoftware101@gmail.com" />
              <input type="hidden" name="item_name" value="Loci AI Lifetime Access" />
              <input type="hidden" name="amount" value="39.99" />
              <input type="hidden" name="currency_code" value="USD" />
              <button type="submit" className="btn success" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', backgroundColor: '#0070ba', color: 'white' }}>
                Pay $39.99 via PayPal
              </button>
            </form>

            <button 
              onClick={() => {
                localStorage.setItem('loci_has_paid', 'true');
                setShowPaymentModal(false);
                setChatHistory(prev => [...prev, { sender: 'system', text: 'Payment verified. Thank you for purchasing Loci AI!' }]);
              }} 
              style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer', marginTop: '1rem' }}
            >
              I have already paid (Unlock)
            </button>
            
            <button 
              className="close-btn" 
              onClick={() => setShowPaymentModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

