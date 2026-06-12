
export default function MetricDetailModal({ selectedMetric, setSelectedMetric }) {
  if (!selectedMetric) return null;

  return (
    <div className="modal-overlay active" id="metric-modal" onClick={() => setSelectedMetric(null)}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{selectedMetric.name}</h3>
          <button type="button" className="btn-close" onClick={() => setSelectedMetric(null)}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="label">Layer</span>
              <span className="value">{selectedMetric.layer}</span>
            </div>
            <div className="meta-item">
              <span className="label">Normalized Score</span>
              <span className="value font-bold">{selectedMetric.score}%</span>
            </div>
            <div className="meta-item">
              <span className="label">Band</span>
              <span className={`value badge ${selectedMetric.band === "High" ? "text-emerald" : "text-moderate"}`}>
                {selectedMetric.band}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">AI Status Flag</span>
              <span className="value badge">{selectedMetric.flag}</span>
            </div>
          </div>

          <div className="modal-section">
            <h4>Counselor Metric Interpretation</h4>
            <p className="description">{selectedMetric.interpretation}</p>
          </div>

          <div className="modal-section">
            <h4>Answer Session Audit</h4>
            <div className="table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>QID</th>
                    <th>Question Item</th>
                    <th>Response</th>
                    <th>Score</th>
                    <th>Time Spent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMetric.audit.map((aud, idx) => (
                    <tr key={idx}>
                      <td>{aud.qid}</td>
                      <td>{aud.question}</td>
                      <td>{aud.response}</td>
                      <td>{aud.score}</td>
                      <td>{aud.timeSpent}</td>
                      <td>
                        <span className={`badge ${aud.status === "CORRECT" || aud.status === "VERIFIED" ? "text-emerald" : ""}`}>
                          {aud.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
