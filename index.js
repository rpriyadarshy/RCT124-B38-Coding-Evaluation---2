import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';


const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(() => JSON.parse(localStorage.getItem('isAuthenticated')) || false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <AppContext.Provider value={{ theme, setTheme, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);


const Navigation = () => {
  const { isAuthenticated, setIsAuthenticated, theme, setTheme } = useAppContext();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className={`nav ${theme}`}>
      <Link to="/">Home</Link>
      <button onClick={toggleTheme}>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</button>
      {isAuthenticated ? (
        <button onClick={() => setIsAuthenticated(false)}>Logout</button>
      ) : (
        <button onClick={() => setIsAuthenticated(true)}>Login</button>
      )}
      <Link to="/admin">Admin</Link>
    </nav>
  );
};


const CategoryPage = ({ params }) => {
  const { type } = params;
  const destinations = []; 

  return (
    <div>
      <h2>{type} Destinations</h2>
      <ul>
        {destinations.map(destination => (
          <li key={destination.id}>
            <Link to={`/destination/${destination.id}`}>{destination.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/">Back to Home</Link>
    </div>
  );
};


const DestinationDetails = ({ params }) => {
  const { id } = params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const destination = {}; // Replace with API call or JSON data
  const images = destination.images || [];

  return (
    <div>
      <h2>{destination.name}</h2>
      <Carousel images={images} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
      <Link to={`/category/${destination.type}`}>Back to {destination.type} Destinations</Link>
    </div>
  );
};


const Carousel = ({ images, currentIndex, setCurrentIndex }) => {
  return (
    <div role="region" aria-label="Image Carousel" tabIndex="0">
      <img
        src={images[currentIndex]}
        alt={`Image ${currentIndex + 1} of ${images.length}`}
        role="img"
        aria-labelledby="carousel-description"
      />
      <button aria-label="Previous Image" onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}>
        Previous
      </button>
      <button aria-label="Next Image" onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}>
        Next
      </button>
      <p id="carousel-description">Use arrow keys to navigate between images.</p>
    </div>
  );
};

// Admin Page with Form Handling and Validation
const AdminPage = () => {
  const [destination, setDestination] = useState({ name: '', type: '', highDemand: false });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setDestination({
      ...destination,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!destination.name) errors.name = 'Name is required';
    if (!destination.type) errors.type = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form data
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Page</h2>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={destination.name} onChange={handleInputChange} />
        {formErrors.name && <span>{formErrors.name}</span>}
      </div>
      <div>
        <label>Type:</label>
        <input type="text" name="type" value={destination.type} onChange={handleInputChange} />
        {formErrors.type && <span>{formErrors.type}</span>}
      </div>
      <div>
        <label>
          <input type="checkbox" name="highDemand" checked={destination.highDemand} onChange={handleInputChange} />
          High Demand
        </label>
      </div>
      {destination.highDemand && (
        <div>
          <label>Additional Options:</label>
          {/* Add more conditional fields here */}
        </div>
      )}
      <button type="submit">Submit</button>
    </form>
  );
};

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Home Page
const HomePage = () => (
  <div>
    <h1>Choose Your Destination Category</h1>
    <Link to="/category/Adventure">Adventure</Link>
    <Link to="/category/Leisure">Leisure</Link>
    <Link to="/category/Cultural">Cultural</Link>
  </div>
);

// Main App Component
const App = () => {
  return (
    <AppProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/destination/:id" element={<DestinationDetails />} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;



body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.nav {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--nav-bg);
  color: var(--nav-color);
}

.nav.light {
  --nav-bg: #fff;
  --nav-color: #000;
}

.nav.dark {
  --nav-bg: #333;
  --nav-color: #fff;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    align-items: center;
  }

  .nav a, .nav button {
    margin-bottom: 0.5rem;
  }
}
