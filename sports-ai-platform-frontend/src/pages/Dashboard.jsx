import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Utility component for Icons
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign: 'middle', marginRight: '5px'}}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

// NEW: Chat Icon with "Chat" text inside
const ChatTextIcon = () => (
    <span style={{ 
        fontWeight: '800', 
        fontSize: '1em', 
        color: 'white', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px' 
    }}>
        Chat
    </span>
);

// 1. Define the data for the sports personalities
const sportsQuotes = [
    {
        image: '/images/michael-jordan.jpg', 
        quote: "I've failed over and over and over again in my life and that is why I succeed.",
        name: 'Michael Jordan',
    },
    {
        image: '/images/Serena-Williams.jpg',
        quote: "The success of every woman should be the inspiration to another.",
        name: 'Serena Williams',
    },
    {
        image: '/images/Lionel Messi.webp',
        quote: "You have to fight to reach your dream. You have to sacrifice and work hard for it.",
        name: 'Lionel Messi', // FOOTBALL (Soccer)
    },
    {
        image: '/images/Muhammad Ali.jpg', 
        quote: "Float like a butterfly, sting like a bee.",
        name: 'Muhammad Ali',
    },
    {
        image: '/images/Pele.webp',
        quote: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.",
        name: 'Pele', // FOOTBALL (Soccer)
    },
    {
        image: '/images/Sachin Tendulkar.jpg',
        quote: "If you remain positive and think positively, nine times out of ten, you will achieve your goals.",
        name: 'Sachin Tendulkar', // CRICKET
    },
];

// ======================================================
// === BLOG DATA ===
// ======================================================
const sportsBlogs = [
    {
        id: 1,
        title: 'The Unstoppable Drive of Michael Jordan',
        summary: 'A look into the competitive fire that fueled the greatest basketball player of all time and his six championships with the Chicago Bulls.',
        category: 'Basketball',
        readTime: '5 min',
        url: 'https://medium.com/%40menonamrita2/the-unstoppable-drive-of-a-basketball-legend-5a1409be3a64',
    },
    {
        id: 2,
        title: 'Serena Williams: Breaking Records and Barriers',
        summary: 'How Serena\'s dominance on the court redefined women\'s tennis and inspired a generation of athletes globally.',
        category: 'Tennis',
        readTime: '7 min',
        url: 'https://www.tonyrobbins.com/blog/serena-williams-unapologetic-greatness?srsltid=AfmBOoo34K11X7st15ftlrC9BE7lNPR4YcOe32auMzAlj--HJ43xE1nS&utm_source=chatgpt.com',
    },
    {
        id: 3,
        title: 'Modern Football Tactics: The Rise of the False Nine',
        summary: 'An in-depth analysis of how fluid formations and tactical innovations are changing the way top European clubs play the beautiful game.',
        category: 'Football (Soccer)',
        readTime: '10 min',
        url: 'https://www.theguardian.com/football/blog/2019/jan/24/false-nine-ancient-tactic-power-shock-football-tactics?utm_source=chatgpt.com',
    },
    {
        id: 4,
        title: 'The Art of the Bouncer: A Cricket Fast-Bowling Guide',
        summary: 'Understanding the mechanics and strategy behind one of cricket\'s most aggressive deliveries, featuring insights from legends like Shoaib Akhtar.',
        category: 'Cricket',
        readTime: '6 min',
        url: 'https://www.outlookindia.com/sports/syed-mushtaq-ali-t20-and-the-art-of-bowling-bouncers-news-301419?utm_source=chatgpt.com',
    },
];


function Dashboard() {
    const role = localStorage.getItem('role') || 'Guest'; // Default role for safety
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };
    
    const goToNextSlide = () => {
        setCurrentSlide((prevSlide) =>
            prevSlide === sportsQuotes.length - 1 ? 0 : prevSlide + 1
        );
    };

    useEffect(() => {
        const interval = setInterval(goToNextSlide, 5000); 
        return () => clearInterval(interval);
    }, [currentSlide]);

    const currentPersonality = sportsQuotes[currentSlide];

    // =================================================================
    // === THEME PALETTE & STYLES (White & Red) ===
    // =================================================================
    const COLORS = {
        // Base Colors
        LIGHT_BG: '#f8f9fa',
        PRIMARY_CARD_BG: '#ffffff',
        TEXT_PRIMARY: '#1a1a1a',
        TEXT_SECONDARY: '#495057',
        // Accent Colors
        RED_PRIMARY: '#E53935',
        RED_ACCENT: '#FF3D00',
        // Gradients
        RED_GRADIENT: 'linear-gradient(90deg, #E53935, #FF3D00)',
        LIGHT_BORDER: '1px solid rgba(0, 0, 0, 0.1)',
    };

    const dashboardContainerStyle = {
        minHeight: '100vh',
        backgroundColor: COLORS.LIGHT_BG, 
        color: COLORS.TEXT_PRIMARY, 
        fontFamily: 'Inter, sans-serif', 
        paddingTop: '70px', // Space for the fixed header
    };
    
    const contentStyle = {
        padding: '20px 40px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        overflowY: 'auto',
    };

    // === TOP BAR STYLES ===
    const topNavStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: COLORS.PRIMARY_CARD_BG,
        borderBottom: COLORS.LIGHT_BORDER,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 40px',
        zIndex: 1000,
    };
    
    // LOGOUT BUTTON STYLE (Now in the Header)
    const logoutButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        marginLeft: '20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9em',
        background: COLORS.RED_PRIMARY, 
        color: 'white',
        fontWeight: '600',
        transition: 'background 0.2s',
    };
    
    // SLIDER STYLES (omitted for brevity, they are unchanged)
    const sliderStyle = {
        width: '100%', 
        height: '400px', 
        margin: '0 0 40px 0',
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        display: 'flex', 
    };

    const sliderImageContainerStyle = {
        flex: '0 0 65%', 
        overflow: 'hidden',
        position: 'relative',
    }

    const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'cover', 
        display: 'block',
        opacity: 1, 
    };

    const overlayStyle = {
        flex: '0 0 35%', 
        backgroundImage: COLORS.RED_GRADIENT, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        textAlign: 'left',
        color: 'white', 
        padding: '40px 30px', 
        position: 'relative',
    };

    const quoteStyle = {
        fontSize: '1.8em',
        marginBottom: '15px',
        fontStyle: 'italic',
        fontWeight: '500', 
        textShadow: '1px 1px 3px rgba(0, 0, 0, 0.4)',
        position: 'relative', 
    };

    const nameStyle = {
        fontSize: '1.3em',
        fontWeight: '800', 
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
    };
    
    // BLOG SECTION STYLES (omitted for brevity, they are unchanged)
    const blogSectionTitleStyle = {
        marginTop: '40px',
        marginBottom: '20px',
        color: COLORS.RED_PRIMARY,
        borderBottom: `2px solid ${COLORS.RED_PRIMARY}`,
        paddingBottom: '10px',
        fontWeight: '700',
    };

    const blogCardContainerStyle = {
        display: 'flex', 
        gap: '20px',
        paddingBottom: '10px', 
        overflowX: 'auto', 
        overflowY: 'hidden', 
        scrollbarWidth: 'thin', 
        msOverflowStyle: 'none', 
    };

    const blogCardStyle = {
        backgroundColor: COLORS.PRIMARY_CARD_BG, 
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        cursor: 'pointer',
        flex: '0 0 320px', 
        height: 'auto', 
        border: COLORS.LIGHT_BORDER,
    };

    const blogCardHoverStyle = {
        transform: 'translateY(-5px)', 
        boxShadow: '0 10px 25px rgba(229, 57, 53, 0.2)', 
        border: `1px solid ${COLORS.RED_PRIMARY}`,
    };

    const blogTitleStyle = {
        fontSize: '1.4em',
        marginBottom: '10px',
        color: COLORS.RED_PRIMARY, 
        fontWeight: '600',
    };

    const blogSummaryStyle = {
        fontSize: '0.9em',
        color: COLORS.TEXT_SECONDARY, 
        marginBottom: '15px',
        fontWeight: '400',
    };

    const blogMetaStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.8em',
        color: COLORS.RED_ACCENT, 
        fontWeight: '600',
    };

    // Primary Button styles (for Create/My Events - unchanged)
    const buttonStyle = {
        padding: '1.125rem 2.5rem', 
        border: 'none',
        borderRadius: '14px', 
        cursor: 'pointer',
        fontSize: '0.95rem',
        background: COLORS.RED_GRADIENT, 
        color: 'white',
        fontWeight: '700',
        textAlign: 'center', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        boxShadow: '0 10px 30px rgba(229, 57, 53, 0.4)', 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%', // Ensures button fills parent Link's width
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
    
    const actionContainerStyle = {
        display: 'flex',
        gap: '30px', 
        margin: '25px 0 40px 0',
        flexWrap: 'wrap',
    }
    
    // Style for Link to ensure equal width for organizer buttons
    const actionLinkStyle = {
        flex: 1, // Distributes space equally
        textDecoration: 'none',
        minWidth: '200px', // Prevents shrinking too much
    };


    const onButtonHover = (e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 15px 45px rgba(229, 57, 53, 0.5)';
    };
    const onButtonLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(229, 57, 53, 0.4)';
    };

    // =================================================================
    // === Blog Card Renderer (unchanged) ===
    // =================================================================
    const renderBlogCard = (blog) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isHovered, setIsHovered] = useState(false); 

        const currentCardStyle = isHovered 
            ? { ...blogCardStyle, ...blogCardHoverStyle } 
            : blogCardStyle;

        return (
            <a
                key={blog.id}
                href={blog.url}
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                    ...currentCardStyle, 
                    textDecoration: 'none', 
                    color: COLORS.TEXT_PRIMARY, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }} 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div>
                    <h4 style={blogTitleStyle}>{blog.title}</h4>
                    <p style={blogSummaryStyle}>{blog.summary}</p>
                </div>
                <div style={blogMetaStyle}>
                    <span>Category: **{blog.category}**</span>
                    <span>**{blog.readTime}** Read</span>
                </div>
            </a>
        );
    };
    // =================================================================

    return (
        <div style={dashboardContainerStyle}>
            {/* === FIXED TOP NAVIGATION BAR === */}
            <div style={topNavStyle}>
                <h3 style={{
                    color: COLORS.RED_PRIMARY,
                    fontWeight: '900',
                    fontSize: '1.5em',
                    letterSpacing: '1px',
                    }}>
                    GAMEBUZZ DASHBOARD
                </h3>

                {/* SIMPLIFIED PROFILE/LOGOUT SECTION */}
                <div style={{ display: 'flex', alignItems: 'center', zIndex: 1001 }}>
                    <span style={{ fontWeight: '600', marginRight: '10px', color: COLORS.TEXT_SECONDARY }}>
                        Role: <strong style={{color: COLORS.RED_PRIMARY}}>{role.toUpperCase()}</strong>
                    </span>
                    
                    {/* DIRECT LOGOUT BUTTON */}
                    <button 
                        style={logoutButtonStyle} 
                        onClick={handleLogout}
                        onMouseEnter={(e) => e.currentTarget.style.background = COLORS.RED_ACCENT}
                        onMouseLeave={(e) => e.currentTarget.style.background = COLORS.RED_PRIMARY}
                    >
                        <UserIcon /> Logout
                    </button>
                </div>
            </div>
          
            {/* =================================================================
                === CONTENT AREA ===
                ================================================================= */}
            <div style={contentStyle}>
                
                {/* === SLIDING IMAGES SECTION === */}
                <div style={sliderStyle}>
                    <div style={sliderImageContainerStyle}>
                        <img
                            src={currentPersonality.image}
                            alt={currentPersonality.name}
                            style={imageStyle}
                        />
                    </div>
                    <div style={overlayStyle}>
                        <p style={quoteStyle}>"{currentPersonality.quote}"</p>
                        <p style={nameStyle}>- {currentPersonality.name}</p>
                    </div>
                </div>
                
                {/* Welcome Message */}
                <div style={{borderBottom: `1px solid ${COLORS.LIGHT_BORDER}`, paddingBottom: '20px', textAlign: 'center'}}>
                    <h2 style={{fontWeight: '800', letterSpacing: '-0.5px', color: COLORS.RED_PRIMARY, display: 'inline-block'}}>
                        Welcome to the Dashboard! 👋
                    </h2>
                    <div style={{width: '60px', height: '3px', background: COLORS.RED_PRIMARY, margin: '10px auto 15px auto'}}></div> {/* Alignment line */}
                    <p style={{color: COLORS.TEXT_SECONDARY, fontSize: '1.1em', marginTop: '10px'}}>
                        This is your central hub. Based on your role, use the links below to manage events or find your next game.
                    </p>
                </div>
                
                {/* === ROLE-SPECIFIC ACTION BUTTONS (Equal Sizing Implemented) === */}
                <div style={actionContainerStyle}>
                    {role === 'organizer' && (
                        <>
                            <Link to="/create-event" style={actionLinkStyle}> 
                                <button style={buttonStyle} onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave}>
                                    <span style={{marginRight: '10px'}}>+</span> Create Event
                                </button>
                            </Link>
                            <Link to="/my-events" style={actionLinkStyle}>
                                <button style={buttonStyle} onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave}>
                                    <span style={{marginRight: '10px'}}>🗓️</span> My Events
                                </button>
                            </Link>
                        </>
                    )}

                    {role === 'player' && (
                        <Link to="/events" style={{width: '100%', textDecoration: 'none'}}>
                            <button style={{...buttonStyle, width: '100%'}} onMouseEnter={onButtonHover} onMouseLeave={onButtonLeave}>
                                <span style={{marginRight: '10px'}}>🏆</span> Find and View Events
                            </button>
                        </Link>
                    )}
                </div>
                
                {/* === SPORTS BLOG SECTION (Horizontal View & Linked) === */}
                <h2 style={blogSectionTitleStyle}>Latest Sports Articles 📰</h2>
                <div style={blogCardContainerStyle}>
                    {sportsBlogs.map(renderBlogCard)}
                </div>
                {/* ================================================================= */}
            </div>

            {/* === FLOATING CHAT BUTTON (Now displays "Chat") === */}
            <Link to="/chat">
                <button style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '65px', 
                    height: '65px', 
                    borderRadius: '50%',
                    border: 'none',
                    background: COLORS.RED_ACCENT, 
                    color: 'white',
                    boxShadow: '0 10px 20px rgba(229, 57, 53, 0.7)', 
                    cursor: 'pointer',
                    zIndex: 9000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s, background 0.2s',
                }} onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                    e.currentTarget.style.background = COLORS.RED_PRIMARY;
                }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1.0) translateY(0)';
                        e.currentTarget.style.background = COLORS.RED_ACCENT;
                    }}
                >
                    <ChatTextIcon /> {/* <-- Changed to use the text component */}
                </button>
            </Link>
        </div>
    );
}

export default Dashboard;