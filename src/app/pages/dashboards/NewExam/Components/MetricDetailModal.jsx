export default function MetricDetailModal({ selectedMetric, setSelectedMetric }) {
  if (!selectedMetric) return null;

  return (
    <div className="modal-overlay active" onClick={() => setSelectedMetric(null)}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{selectedMetric.name || selectedMetric.subdomain}</h3>
          <button type="button" className="btn-close" onClick={() => setSelectedMetric(null)}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="label">Layer</span>
              <span className="value">{selectedMetric.layer || selectedMetric.domain}</span>
            </div>
            <div className="meta-item">
              <span className="label">Score</span>
              <span className="value" style={{ fontWeight: 700 }}>{selectedMetric.score}%</span>
            </div>
            <div className="meta-item">
              <span className="label">Band</span>
              <span className={`value badge ${selectedMetric.band === "High" ? "text-high" : selectedMetric.band === "Moderate" ? "text-moderate" : "text-low"}`}>
                {selectedMetric.band}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">Flag</span>
              <span className="value badge">{selectedMetric.flag || "OK"}</span>
            </div>
          </div>
          <div className="modal-section">
            <h4>Counselor Metric Interpretation</h4>
            <p className="description">{selectedMetric.interpretation || "Standard developmental metric."}</p>
          </div>
          <div className="modal-section">
            <h4>Answer Session Audit</h4>
            <div className="table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>QID</th>
                    <th>Question</th>
                    <th>Response</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedMetric.audit || []).map((aud, idx) => (
                    <tr key={idx}>
                      <td>{aud.qid}</td>
                      <td>{aud.question}</td>
                      <td>{aud.response}</td>
                      <td>{aud.score}</td>
                      <td>{aud.timeSpent}</td>
                      <td><span className="badge text-high">{aud.status}</span></td>
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
