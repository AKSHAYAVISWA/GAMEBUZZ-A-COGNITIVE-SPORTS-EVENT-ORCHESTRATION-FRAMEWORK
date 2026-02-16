import React, { useState } from 'react';
import axios from 'axios';

function CreateEvent() {
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    date: '',
    location: '',
    fee: '',
    feeCurrency: 'INR',
    eventType: 'Individual',
    teamSize: '',
  });

  const [requiredDocs, setRequiredDocs] = useState([
    { name: 'Aadhar Card', required: true, fixed: true }, // ✅ mandatory
  ]);

  const [posterFile, setPosterFile] = useState(null);
  const [guidelineFile, setGuidelineFile] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addRequiredDoc = () =>
    setRequiredDocs([...requiredDocs, { name: '', required: true, fixed: false }]);

  const updateRequiredDoc = (idx, value) => {
    const arr = [...requiredDocs];
    if (!arr[idx].fixed) {
      arr[idx].name = value;
      setRequiredDocs(arr);
    }
  };

  const removeRequiredDoc = (idx) => {
    const arr = [...requiredDocs];
    if (!arr[idx].fixed) {
      arr.splice(idx, 1);
      setRequiredDocs(arr);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();

      fd.append('name', formData.name);
      fd.append('sport', formData.sport);
      fd.append('date', formData.date);
      fd.append('location', formData.location);
      fd.append('fee', formData.fee ? Number(formData.fee) : 0);
      fd.append('feeCurrency', formData.feeCurrency || 'INR');
      fd.append('eventType', formData.eventType);
      fd.append('requiredDocs', JSON.stringify(requiredDocs));

      if (formData.eventType === 'Team') {
        fd.append('teamSize', formData.teamSize ? Number(formData.teamSize) : 0);
      }

      if (posterFile) fd.append('poster', posterFile);
      if (guidelineFile) fd.append('guideline', guidelineFile);

      await axios.post('http://localhost:5000/api/events', fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Event created successfully');
      // Reset form
      setFormData({
        name: '',
        sport: '',
        date: '',
        location: '',
        fee: '',
        feeCurrency: 'INR',
        eventType: 'Individual',
        teamSize: '',
      });
      setRequiredDocs([{ name: 'Aadhar Card', required: true, fixed: true }]);
      setPosterFile(null);
      setGuidelineFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || '❌ Error creating event');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Event Name"
          value={formData.name}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="sport"
          placeholder="Sport"
          value={formData.sport}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="fee"
          type="number"
          placeholder="Fee"
          value={formData.fee}
          onChange={handleChange}
        /><br/>
        <select name="feeCurrency" value={formData.feeCurrency} onChange={handleChange}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select><br/>

        <h4>Event Type</h4>
        <select name="eventType" value={formData.eventType} onChange={handleChange}>
          <option value="Individual">Individual</option>
          <option value="Team">Team</option>
        </select><br/>

        {formData.eventType === 'Team' && (
          <>
            <input
              name="teamSize"
              type="number"
              placeholder="Team Size"
              value={formData.teamSize}
              onChange={handleChange}
              min={1}
              required
            /><br/>
          </>
        )}

        <h4>Required Documents</h4>
        {requiredDocs.map((d, idx) => (
          <div key={idx}>
            <input
              value={d.name}
              onChange={(e) => updateRequiredDoc(idx, e.target.value)}
              placeholder="Document name"
              disabled={d.fixed}
            />
            {!d.fixed && (
              <button type="button" onClick={() => removeRequiredDoc(idx)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRequiredDoc}>Add document</button>

        <h4>Event Poster</h4>
        <input type="file" onChange={(e) => setPosterFile(e.target.files[0])} accept="image/*" /><br/>

        <h4>Event Guideline (optional)</h4>
        <input type="file" onChange={(e) => setGuidelineFile(e.target.files[0])} accept=".pdf,.doc,.docx,.png" /><br/>

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default CreateEvent;
