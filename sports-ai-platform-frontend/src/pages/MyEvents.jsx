import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [openEventId, setOpenEventId] = useState(null);

  // Certificate states
  const [certificateEvent, setCertificateEvent] = useState(null);
  const [viewCertEvent, setViewCertEvent] = useState(null);
  const [certificates, setCertificates] = useState([]);

  // Signature states
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureUploaded, setSignatureUploaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/events/my-events", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ✅ DELETE EVENT (FIXED)
  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      alert("Event deleted successfully");
    } catch (err) {
      console.error("DELETE ERROR:", err.response || err.message);
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  // ✅ EDIT EVENT (ENSURE ROUTE EXISTS)
  const editEvent = (eventId) => {
    navigate(`/events/${eventId}/edit`);
    // If your route is different, change ONLY this line
  };

  // ✅ FETCH REGISTRATIONS
  const fetchRegistrations = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/events/${eventId}/registrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRegistrations((prev) => ({ ...prev, [eventId]: res.data }));
      setOpenEventId(openEventId === eventId ? null : eventId);
    } catch {
      alert("Failed to fetch registrations");
    }
  };

  // ✅ FETCH CERTIFICATES
  const fetchCertificates = async (event) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/certificates/${event._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCertificates(res.data);
      setViewCertEvent(event);
    } catch {
      alert("Failed to fetch certificates");
    }
  };

  // ✅ UPLOAD SIGNATURE
  const uploadSignature = async () => {
    if (!signatureFile) {
      alert("Please select a PNG signature file");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("signature", signatureFile);

      await axios.post(
        "http://localhost:5000/api/admin/upload-signature",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSignatureUploaded(true);
      alert("Signature uploaded successfully");
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response || err.message);
      alert(err.response?.data?.msg || "Signature upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Events</h2>

      {events.length === 0 && <p>No events created yet.</p>}

      {events.map((event) => (
        <div
          key={event._id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>
            {event.name} ({event.sport})
          </h3>

          <p><b>Date:</b> {event.date?.substring(0, 10)}</p>
          <p><b>Location:</b> {event.location}</p>
          <p><b>Event Type:</b> {event.eventType}</p>

          {event.eventType === "Team" && (
            <p><b>Team Size:</b> {event.teamSize || "Not specified"}</p>
          )}

          <p>
            <b>Fee:</b> {event.fee} {event.feeCurrency}
          </p>

          {event.poster && (
            <img
              src={`http://localhost:5000${event.poster}`}
              alt="Poster"
              style={{ width: "200px", marginTop: "10px", cursor: "pointer" }}
              onClick={() =>
                setSelectedPoster(`http://localhost:5000${event.poster}`)
              }
            />
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => editEvent(event._id)}>Edit</button>{" "}
            <button onClick={() => deleteEvent(event._id)}>Delete</button>{" "}
            <button onClick={() => fetchRegistrations(event._id)}>
              {openEventId === event._id
                ? "Hide Registrations"
                : "View Registrations"}
            </button>{" "}
            <button
              style={{ backgroundColor: "#4CAF50", color: "white" }}
              onClick={() => {
                setCertificateEvent(event);
                setSignatureUploaded(false);
                setSignatureFile(null);
              }}
            >
              Generate Certificates
            </button>{" "}
            <button
              style={{ backgroundColor: "#2196F3", color: "white" }}
              onClick={() => fetchCertificates(event)}
            >
              View Certificates
            </button>
          </div>

          {/* ✅ FULL REGISTRATION DETAILS */}
          {openEventId === event._id && registrations[event._id] && (
            <div style={{ marginTop: "15px" }}>
              <h4>Registrations</h4>

              {registrations[event._id].length === 0 ? (
                <p>No registrations yet.</p>
              ) : (
                registrations[event._id].map((reg) => (
                  <div
                    key={reg._id}
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "6px",
                    }}
                  >
                    <p><b>Type:</b> {reg.type}</p>

                    {reg.type === "Individual" && reg.members?.[0] && (
                      <div style={{ marginLeft: "10px" }}>
                        <p><b>Name:</b> {reg.members[0].name}</p>
                        <p><b>Age:</b> {reg.members[0].age}</p>
                        <p><b>Email:</b> {reg.members[0].email}</p>
                        <p><b>Phone:</b> {reg.members[0].phone}</p>
                      </div>
                    )}

                    {reg.type === "Team" && reg.members?.length > 0 && (
                      <ul>
                        {reg.members.map((m, i) => (
                          <li key={i}>
                            {m.name} – {m.email}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* GENERATE CERTIFICATE MODAL */}
      {certificateEvent && (
        <div style={modalStyle}>
          <div style={boxStyle}>
            <h3>Generate Certificates</h3>

            <input
              type="file"
              accept="image/png"
              onChange={(e) => setSignatureFile(e.target.files[0])}
            />

            <button onClick={uploadSignature}>Upload Signature</button>

            {signatureUploaded && (
              <p style={{ color: "green" }}>✔ Signature uploaded</p>
            )}

            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                await axios.post(
                  `http://localhost:5000/api/certificates/generate/${certificateEvent._id}`,
                  {},
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Certificates generated");
              }}
            >
              Generate for All
            </button>

            <button onClick={() => setCertificateEvent(null)}>Close</button>
          </div>
        </div>
      )}

      {/* VIEW CERTIFICATES */}
      {viewCertEvent && (
        <div style={modalStyle}>
          <div style={boxStyle}>
            <h3>Certificates</h3>

            {certificates.map((cert, i) => (
              <div key={i}>
                {cert.participantName}{" "}
                <a
                  href={`http://localhost:5000${cert.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </div>
            ))}

            <button onClick={() => setViewCertEvent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const boxStyle = {
  background: "#fff",
  padding: "20px",
  width: "400px",
  borderRadius: "8px",
};

export default MyEvents;
