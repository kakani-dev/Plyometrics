export default function MetricDetailModal({ selectedMetric, setSelectedMetric, resultsData }) {
  if (!selectedMetric) return null;

  const band = selectedMetric.band || selectedMetric.Band;
  const name = selectedMetric.name || selectedMetric.Name || selectedMetric.subdomain || selectedMetric.Subdomain;
  const score = selectedMetric.score ?? selectedMetric.Score ?? selectedMetric.score0100 ?? selectedMetric.Score0100 ?? selectedMetric.score_0_100 ?? selectedMetric.Score_0_100;
  const layer = selectedMetric.layer || selectedMetric.Layer || selectedMetric.domain || selectedMetric.Domain;
  const flag = selectedMetric.flag || selectedMetric.Flag || "OK";
  const interpretation = selectedMetric.interpretation || selectedMetric.Interpretation || "Standard developmental metric.";

  const auditList = selectedMetric.audit || selectedMetric.Audit || (resultsData && (resultsData.auditResponses || resultsData.AuditResponses || []).filter(
    (aud) => (aud.subdomain || aud.Subdomain) === (selectedMetric.subdomain || selectedMetric.Subdomain)
  ).map(aud => ({
    qid: aud.qid || aud.QID,
    question: aud.question || aud.Question || `Response for QID ${aud.qid || aud.QID}`,
    response: aud.response || aud.Response || aud.responseValue || aud.ResponseValue,
    score: aud.score ?? aud.Score ?? (aud.score_0_100 ?? aud.Score_0_100 ?? (aud.score0100 ?? aud.Score0100 ?? "")),
    timeSpent: aud.timeSpent || aud.TimeSpent || (aud.timeSec !== undefined ? `${aud.timeSec}s` : aud.TimeSec !== undefined ? `${aud.TimeSec}s` : ""),
    status: aud.status || aud.Status || "VERIFIED"
  }))) || [];

  return (
    <div className="modal-overlay active" onClick={() => setSelectedMetric(null)}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{name}</h3>
          <button type="button" className="btn-close" onClick={() => setSelectedMetric(null)}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="meta-item">
              <span className="label">Layer</span>
              <span className="value">{layer}</span>
            </div>
            <div className="meta-item">
              <span className="label">Score</span>
              <span className="value" style={{ fontWeight: 700 }}>{score}%</span>
            </div>
            <div className="meta-item">
              <span className="label">Band</span>
              <span className={`value badge ${band === "High" ? "text-high" : band === "Moderate" ? "text-moderate" : "text-low"}`}>
                {band}
              </span>
            </div>
            <div className="meta-item">
              <span className="label">Flag</span>
              <span className="value badge">{flag}</span>
            </div>
          </div>
          <div className="modal-section">
            <h4>Counselor Metric Interpretation</h4>
            <p className="description">{interpretation}</p>
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
                  {auditList.map((aud, idx) => (
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
