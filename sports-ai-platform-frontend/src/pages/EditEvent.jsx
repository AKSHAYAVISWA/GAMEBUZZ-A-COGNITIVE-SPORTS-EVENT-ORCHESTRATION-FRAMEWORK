// src/pages/EditEvent.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState({
    name: '',
    sport: '',
    date: '',
    location: '',
    fee: '',
    feeCurrency: 'INR',
    eventType: 'Individual',
    teamSize: 0,
  });

  const [requiredDocs, setRequiredDocs] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [guidelineFile, setGuidelineFile] = useState(null);
  const [errors, setErrors] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/events/${eventId}`)
      .then(res => {
        const data = res.data;

        // Ensure Aadhar is always present and fixed
        const docs = data.requiredDocs || [];
        const hasAadhar = docs.some(d => d.name === 'Aadhar Card');
        if (!hasAadhar) {
          docs.unshift({ name: 'Aadhar Card', required: true, fixed: true });
        } else {
          docs.forEach(d => {
            if (d.name === 'Aadhar Card') d.fixed = true;
          });
        }

        setEventData({
          name: data.name,
          sport: data.sport,
          date: data.date?.substring(0, 10),
          location: data.location,
          fee: data.fee,
          feeCurrency: data.feeCurrency,
          eventType: data.eventType,
          teamSize: data.teamSize || 0,
        });
        setRequiredDocs(docs);
      })
      .catch(err => {
        console.error(err);
        setErrors('Failed to load event data');
      });
  }, [eventId]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const addRequiredDoc = () =>
    setRequiredDocs([...requiredDocs, { name: '', required: true, fixed: false }]);

  const updateRequiredDoc = (idx, value) => {
    const docs = [...requiredDocs];
    if (!docs[idx].fixed) { // prevent editing Aadhar
      docs[idx].name = value;
      setRequiredDocs(docs);
    }
  };

  const removeRequiredDoc = (idx) => {
    const docs = [...requiredDocs];
    if (!docs[idx].fixed) { // prevent removing Aadhar
      docs.splice(idx, 1);
      setRequiredDocs(docs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();

      Object.entries(eventData).forEach(([key, value]) => fd.append(key, value));
      fd.append('requiredDocs', JSON.stringify(requiredDocs));

      if (posterFile) fd.append('poster', posterFile);
      if (guidelineFile) fd.append('guideline', guidelineFile);

      await axios.put(`http://localhost:5000/api/events/${eventId}`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      alert('✅ Event updated successfully!');
      navigate('/my-events');
    } catch (err) {
      console.error(err);
      setErrors(err.response?.data?.msg || 'Failed to update event');
    }
  };

  if (!eventData) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Event</h2>
      {errors && <p style={{ color: 'red' }}>{errors}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Event Name" value={eventData.name} onChange={handleChange} /><br/>
        <input name="sport" placeholder="Sport" value={eventData.sport} onChange={handleChange} /><br/>
        <input name="date" type="date" value={eventData.date} onChange={handleChange} /><br/>
        <input name="location" placeholder="Location" value={eventData.location} onChange={handleChange} /><br/>
        <input name="fee" type="number" placeholder="Fee" value={eventData.fee} onChange={handleChange} /><br/>
        <select name="feeCurrency" value={eventData.feeCurrency} onChange={handleChange}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select><br/>

        <h4>Event Type</h4>
        <select name="eventType" value={eventData.eventType} onChange={handleChange}>
          <option value="Individual">Individual</option>
          <option value="Team">Team</option>
        </select><br/>

        {eventData.eventType === 'Team' && (
          <>
            <input name="teamSize" type="number" placeholder="Team Size" value={eventData.teamSize} onChange={handleChange} /><br/>
          </>
        )}

        <h4>Required Documents</h4>
        {requiredDocs.map((doc, idx) => (
          <div key={idx}>
            <input
              value={doc.name}
              onChange={(e) => updateRequiredDoc(idx, e.target.value)}
              placeholder="Document Name"
              disabled={doc.fixed} // ✅ Prevent editing Aadhar
            />
            {!doc.fixed && (
              <button type="button" onClick={() => removeRequiredDoc(idx)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRequiredDoc}>Add Document</button><br/>

        <h4>Event Poster</h4>
        <input type="file" accept="image/*" onChange={(e)=>setPosterFile(e.target.files[0])} /><br/>

        <h4>Event Guideline (optional)</h4>
        <input type="file" accept=".pdf,.doc,.docx,.png" onChange={(e)=>setGuidelineFile(e.target.files[0])} /><br/>

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
}

export default EditEvent;
