// src/pages/ViewEvents.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ViewEvents() {
  const [events, setEvents] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null); // for modal

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/events')
      .then((res) => setEvents(res.data))
      .catch((err) => console.error(err));
  }, []);

  const closeModal = () => setSelectedPoster(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Events</h2>

      {events.length === 0 && <p>No events available.</p>}

      {events.map((event) => (
        <div
          key={event._id}
          style={{
            border: '1px solid black',
            margin: '10px',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          <h3>
            {event.name} ({event.sport})
          </h3>
          <p>Date: {event.date?.substring(0, 10)}</p>
          <p>Location: {event.location}</p>
          <p>Event Type: {event.eventType}</p>
          {event.eventType === 'Team' && (
            <p>Team Size: {event.teamSize || 'Not specified'}</p>
          )}
          <p>Fee: {event.fee} {event.feeCurrency}</p>

          {/* Poster thumbnail */}
          {event.poster && (
            <div style={{ margin: '10px 0' }}>
              <h4>Event Poster:</h4>
              <img
                src={`http://localhost:5000${event.poster}`}
                alt="Event Poster"
                style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer', borderRadius: '8px' }}
                onClick={() => setSelectedPoster(`http://localhost:5000${event.poster}`)}
              />
            </div>
          )}

          {/* Guideline / instruction file */}
          {event.guidelineFile && (
            <div style={{ margin: '10px 0' }}>
              <h4>Event Instructions:</h4>
              <a
                href={`http://localhost:5000${event.guidelineFile}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View / Download Instructions
              </a>
            </div>
          )}

          {/* Register button */}
          <Link to={`/events/${event._id}/register`}>
            <button>Register</button>
          </Link>
        </div>
      ))}

      {/* Poster Modal */}
      {selectedPoster && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <img
            src={selectedPoster}
            alt="Poster Large"
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
          />
        </div>
      )}
    </div>
  );
}

export default ViewEvents;
