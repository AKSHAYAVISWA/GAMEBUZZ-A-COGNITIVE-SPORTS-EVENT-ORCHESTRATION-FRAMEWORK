import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function RegisterEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [type, setType] = useState("Individual");
  const [teamName, setTeamName] = useState("");
  const [location, setLocation] = useState("");
  const [members, setMembers] = useState([]);
  const [membersDocs, setMembersDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationId, setRegistrationId] = useState(null);

  // Load event details
  useEffect(() => {
    axios.get(`http://localhost:5000/api/events/${eventId}`)
      .then(res => {
        setEvent(res.data);
        const eventType = res.data.eventType;
        setType(eventType);

        const teamSize = eventType === "Team" ? res.data.teamSize : 1;

        // Initialize member fields
        const initialMembers = Array.from({ length: teamSize }, () => ([
          { label: "Name", value: "", type: "text" },
          { label: "Age", value: "", type: "number" },
          { label: "Email", value: "", type: "email" },
          { label: "Phone", value: "", type: "text" },
        ]));

        setMembers(initialMembers);
        
        // 🚀 FIX: Use Array.from to create unique object references 
        // for each member's documents state to prevent cross-member file overwrites.
        setMembersDocs(Array.from({ length: teamSize }, () => ({}))); 
      })
      .catch(err => console.error("Error fetching event:", err));
  }, [eventId]);

  // Update member fields
  const handleMemberChange = useCallback((mIdx, fIdx, value) => {
    const updated = [...members];
    updated[mIdx][fIdx].value = value;
    setMembers(updated);
  }, [members]);

  // Update uploaded docs for member
  const handleMemberDocChange = useCallback((mIdx, docName, file) => {
    // IMPORTANT: Deep copy the membersDocs array to ensure React detects the change
    const updated = membersDocs.map((doc, index) => {
        if (index === mIdx) {
            return {
                ...doc, // Keep existing docs for this member
                [docName]: file // Add/Update the new file
            };
        }
        return doc; // Return other members' docs as is
    });
    setMembersDocs(updated);
  }, [membersDocs]);

  // -------------------------------------------------------------------
  // Step 1: Submit Member Details
  // -------------------------------------------------------------------
  const handleStepOneSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);

    try {
      const payload = {
        type,
        location,
        members: members.map(member => 
          member.reduce((acc, field) => ({ ...acc, [field.label.toLowerCase()]: field.value }), {})
        ),
      };

      if (type === "Team") {
        payload.teamName = teamName;
      }

      // 🎯 API Call 1: Start partial registration
      const res = await axios.post(
        `http://localhost:5000/api/registrations/${eventId}/start`,
        payload
      );
      
      // Store the ID returned by the backend for Step 2
      setRegistrationId(res.data.registrationId);
      setStep(2); // Move to document upload page
    } catch (err) {
      console.error(err);
      // Use a modal or clearer message instead of alert in production
      alert(err.response?.data?.message || "Step 1 registration failed."); 
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // Step 2: Submit Documents and Finalize Verification
  // -------------------------------------------------------------------
  const handleStepTwoSubmit = async (e) => {
    e.preventDefault();
    // Use a custom UI element for this check instead of alert
    if (!registrationId) return console.error("Missing registration ID. Please go back to Step 1.");

    const formData = new FormData();
    formData.append("registrationId", registrationId);

    // Append uploaded documents with correct field names
    membersDocs.forEach((memberFiles, mIdx) => {
      Object.entries(memberFiles).forEach(([docName, file]) => {
        // Individual events always use member0 as index, which is correct because the 
        // membersDocs array will only have one element (mIdx=0).
        const memberIndex = type === "Team" ? mIdx : 0; 
        const fieldName = `member${memberIndex}_${docName}`;
        formData.append(fieldName, file);
      });
    });

    setLoading(true);
    try {
      // 🎯 API Call 2: Upload docs, trigger OCR verification, and finalize
      const res = await axios.post(
        `http://localhost:5000/api/registrations/verify-and-complete`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      alert(res.data.message);
      navigate(`/event/${eventId}/success`); // Redirect to a success page
    } catch (err) {
      console.error(err);
      // Backend should return a specific message for verification failure
      alert(err.response?.data?.message || "Document verification failed. Please check your uploads.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <p>Loading event details...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register for {event.name} - Step {step} of 2</h2>
      
      {/* ------------------------------------------------------------------- */}
      {/* STEP 1: DETAILS INPUT                           */}
      {/* ------------------------------------------------------------------- */}
      {step === 1 && (
        <form onSubmit={handleStepOneSubmit}>
          {type === "Team" && (
            <div style={{ marginBottom: "15px" }}>
              <label>Team Name:</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label>Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <h3>Member Details (Step 1)</h3>
          {members.map((memberFields, mIdx) => (
            <div
              key={mIdx}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px"
              }}
            >
              <h4>{type === "Team" ? `Member ${mIdx + 1}` : "Participant"}</h4>

              {/* Member info fields */}
              {memberFields.map((field, fIdx) => (
                <div key={fIdx} style={{ marginBottom: "10px" }}>
                  <label>{field.label}:</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleMemberChange(mIdx, fIdx, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          ))}

          <button type="submit" disabled={loading}>
            {loading ? "Saving Details..." : "Next: Upload Documents (Step 2)"}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* STEP 2: DOCUMENT UPLOAD                         */}
      {/* ------------------------------------------------------------------- */}
      {step === 2 && (
        <form onSubmit={handleStepTwoSubmit}>
          <p>
            Please upload the required documents. Your **Name and Age/DOB** will be verified against the details you provided in Step 1.
          </p>

          <h3>Document Uploads (Step 2)</h3>
          {members.map((_, mIdx) => (
            <div
              key={mIdx}
              style={{
                marginBottom: "20px",
                padding: "10px",
                border: "1px solid #cce",
                borderRadius: "8px"
              }}
            >
              <h4>{type === "Team" ? `Member ${mIdx + 1}` : "Participant"} Documents</h4>
              
              {/* Member document uploads */}
              {event.requiredDocs && event.requiredDocs.length > 0 && (
                <div>
                  {event.requiredDocs.map((doc, dIdx) => (
                    <div key={dIdx} style={{ marginBottom: "10px" }}>
                      <label>
                        {doc.name} {doc.required && "*"}
                      </label>
                      <input
                        type="file"
                        accept={doc.name === "Aadhar Card" ? ".pdf,.jpg,.jpeg,.png" : "*"}
                        onChange={(e) =>
                          handleMemberDocChange(mIdx, doc.name, e.target.files[0])
                        }
                        // Note: Aadhar Card is required implicitly for OCR verification
                        required={doc.required || doc.name === "Aadhar Card"} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <button type="button" onClick={() => setStep(1)} style={{ marginRight: "10px" }}>
            &larr; Back to Details (Step 1)
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying & Finalizing..." : "Submit Registration"}
          </button>
        </form>
      )}
    </div>
  );
}

export default RegisterEvent;
