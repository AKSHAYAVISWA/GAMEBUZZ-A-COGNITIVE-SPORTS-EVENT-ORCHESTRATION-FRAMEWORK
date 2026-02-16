import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch users
    fetchAllUsers();
    fetchAllEvents();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/admin/users', config);
      setUsers(res.data);
    } catch (err) {
      alert('Error fetching users');
    }
  };

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/admin/events', config);
      setEvents(res.data);
    } catch (err) {
      alert('Error fetching events');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>

      <h3>All Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u._id}>{u.name} ({u.role})</li>
        ))}
      </ul>

      <h3>All Events</h3>
      <ul>
        {events.map((e) => (
          <li key={e._id}>{e.name} - {e.location}</li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanel;
