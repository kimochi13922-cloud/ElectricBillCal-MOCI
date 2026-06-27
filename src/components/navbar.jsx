import { useState } from 'react'
import './navbar.css'

function Navbar() {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const navItems = [
    { id: 1, label: 'Home', icon: '🏠' },
    
  ]

  return (
    <nav className={`navbar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="navbar-header">
        <h2 className="navbar-title">Dev</h2>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.id} className="nav-item">
            <a href="#" className="nav-link">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="navbar-footer">
        <p className="footer-text">© 2024 Portfolio</p>
      </div>
    </nav>
  )
}

export default Navbar
