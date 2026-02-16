import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import ViewEvents from './pages/ViewEvents';
import AdminPanel from './pages/AdminPanel';
import Chatbot from './pages/Chatbot';
import RegisterEvent from './pages/RegisterEvent'; // <-- import it
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';

function App() {
  return (
    <div>
      {/* Simple Navbar */}
      <nav>
        <Link to="/login">Login</Link> | {' '}
        <Link to="/register">Register</Link> | {' '}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/events" element={<ViewEvents />} />
        <Route path="/events/:eventId/register" element={<RegisterEvent />} /> {/* <-- new route */}
        <Route path="/register/:eventId" element={<RegisterEvent />} />

        <Route path="/events/:eventId/edit" element={<EditEvent />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/my-events" element={<MyEvents />} />
        {/* Default route */}
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
