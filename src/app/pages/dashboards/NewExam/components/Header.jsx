import neuropiLogo from "../../../../../assets/Neuuropi-B8yLP3Ei.svg";

export default function Header({ currentScreen, profile }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-area">
          <img src={neuropiLogo} alt="NEUROPI TECH PRIVATE LIMITED Logo" className="brain-logo" style={{ width: 150, height: "auto" }} />
          <div className="brand-text">
            <h1>NEUROPI TECH PRIVATE LIMITED</h1>
            <span className="sub-brand">pi tech pvt ltd</span>
          </div>
        </div>
        {currentScreen !== "welcome" && (
          <div className="header-status">
            <span className="status-badge">{profile.name}</span>
            <span className="status-badge mode-badge">
              Adaptive Engine
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
