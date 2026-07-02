import PropTypes from "prop-types";
import { forwardRef } from "react";

function parseReportSections(text) {
  if (!text) return null;
  const sections = { sec1: "", sec2: "", sec3: "", sec4: "" };
  const s1 = text.indexOf("[SECTION 1]");
  const s2 = text.indexOf("[SECTION 2]");
  const s3 = text.indexOf("[SECTION 3]");
  const s4 = text.indexOf("[SECTION 4]");
  if (s1 !== -1 && s2 !== -1) sections.sec1 = text.substring(s1 + 11, s2).trim();
  if (s2 !== -1 && s3 !== -1) sections.sec2 = text.substring(s2 + 11, s3).trim();
  if (s3 !== -1 && s4 !== -1) sections.sec3 = text.substring(s3 + 11, s4).trim();
  if (s4 !== -1) sections.sec4 = text.substring(s4 + 11).trim();
  if (!sections.sec1 && !sections.sec2) {
    const paras = text.split("\n\n").filter((p) => p.trim().length > 20);
    return { sec1: paras[0] || "", sec2: paras[1] || "", sec3: paras[2] || "", sec4: paras.slice(3).join("\n\n") || "" };
  }
  return sections;
}

const AiReportView = forwardRef(function AiReportView({ text, testName, sessionId }, ref) {
  const sections = parseReportSections(text);
  const today = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div ref={ref} className="report-content">
      <div className="report-watermark">NEUROPI TECH PRIVATE LIMITED - REPORT</div>

      <div className="report-doc-header">
        <div className="report-doc-title">
          <h2>Student Development Intelligence Report</h2>
          <p className="subtitle">NEUROPI TECH PRIVATE LIMITED - Psychological and Cognitive Diagnostic Profiling</p>
        </div>
        <div className="report-doc-meta">
          <div><strong>Test:</strong> {testName}</div>
          <div><strong>Date:</strong> {today}</div>
          <div><strong>Session:</strong> {sessionId}</div>
        </div>
      </div>

      <hr className="report-divider" />

      {sections?.sec1 && (
        <div className="report-section">
          <h3>I. Executive Assessment Summary</h3>
          <p>{sections.sec1}</p>
        </div>
      )}

      {sections?.sec2 && (
        <div className="report-section">
          <h3>II. Cognitive Reasoning &amp; Learning Profile</h3>
          <p>{sections.sec2}</p>
        </div>
      )}

      {sections?.sec3 && (
        <div className="report-section">
          <h3>III. Academic and Career Trajectory</h3>
          <p>{sections.sec3}</p>
        </div>
      )}

      {sections?.sec4 && (
        <div className="report-section">
          <h3>IV. Counseling Recommendations</h3>
          <p>{sections.sec4}</p>
        </div>
      )}

      <div className="report-doc-footer">
        <div className="signature-line">
          <div className="signature-space" />
          <p>Counseling Director</p>
        </div>
        <div className="signature-line">
          <div className="signature-space" />
          <p>Lead Psychologist</p>
        </div>
      </div>
    </div>
  );
});

AiReportView.propTypes = {
  text: PropTypes.string,
  testName: PropTypes.string,
  sessionId: PropTypes.string,
};

export default AiReportView;
