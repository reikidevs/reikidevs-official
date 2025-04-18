import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import '../../styles/Dashboard.css';

function PortfolioManagement() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectTypeFilter, setProjectTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');
  const [projectTypes, setProjectTypes] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      
      // Check if user is admin or superadmin
      if (!parsedUser.role || (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin')) {
        navigate('/');
      } else {
        // Fetch project types
        fetchProjectTypes();
        // Fetch portfolio data
        fetchPortfolios();
      }
    } else {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    // Fetch portfolio data when these dependencies change
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchPortfolios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, projectTypeFilter, featuredFilter, projectStatusFilter, searchTerm]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      let url = `/api/portfolio?page=${currentPage}&limit=9`;
      
      if (projectTypeFilter !== 'all') {
        url += `&projectType=${projectTypeFilter}`;
      }
      
      if (featuredFilter !== 'all') {
        url += `&isFeatured=${featuredFilter === 'featured'}`;
      }
      
      if (projectStatusFilter !== 'all') {
        url += `&projectStatus=${projectStatusFilter}`;
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const response = await axios.get(url);
      setPortfolios(response.data.portfolioItems);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setLoading(false);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const response = await axios.get('/api/portfolio/project-types');
      setProjectTypes(response.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await axios.delete(`/api/portfolio/${id}`);
        // Refresh portfolio list
        fetchPortfolios();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('Failed to delete portfolio item');
      }
    }
  };

  const toggleFeatured = async (id, currentStatus) => {
    try {
      await axios.put(`/api/portfolio/${id}`, { isFeatured: !currentStatus });
      // Refresh portfolio list
      fetchPortfolios();
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleProjectTypeFilterChange = (e) => {
    setProjectTypeFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleFeaturedFilterChange = (e) => {
    setFeaturedFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleProjectStatusFilterChange = (e) => {
    setProjectStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const toggleSearchMode = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm(''); // Clear search term when closing search
    }
  };

  const filteredPortfolios = portfolios;

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <DashboardHeader />
        
        <div className="content-header">
          <h2>Portfolio Management</h2>
          <Link to="/dashboard/portfolio/create" className="btn-primary">
            <FaPlus /> Add New Project
          </Link>
        </div>
        
        <div className="search-filter">
          {showSearch ? (
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                position: 'relative', 
                flex: 1, 
                display: 'flex', 
                border: '1px solid rgba(0, 102, 255, 0.15)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 102, 255, 0.05)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0 0.95rem',
                  color: 'var(--primary-color)'
                }}>
                  <FaSearch />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by title, category or client..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{ 
                    flex: 1, 
                    padding: '0.85rem 0.5rem 0.85rem 0', 
                    border: 'none',
                    fontSize: '0.95rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif'
                  }}
                />
              </div>
              <button 
                onClick={toggleSearchMode}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  transition: 'color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close search"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={toggleSearchMode} 
                style={{ 
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 102, 255, 0.15)',
                  backgroundColor: '#E6F0FF',
                  color: '#0066FF',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 102, 255, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '45px',
                  height: '45px'
                }}
              >
                <FaSearch />
              </button>
              <select 
                className="filter-select"
                value={projectTypeFilter}
                onChange={handleProjectTypeFilterChange}
              >
                <option value="all">All Project Types</option>
                {projectTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
              <select 
                className="filter-select"
                value={featuredFilter}
                onChange={handleFeaturedFilterChange}
              >
                <option value="all">All Featured Status</option>
                <option value="featured">Featured</option>
                <option value="not-featured">Not Featured</option>
              </select>
              <select 
                className="filter-select"
                value={projectStatusFilter}
                onChange={handleProjectStatusFilterChange}
              >
                <option value="all">All Project Status</option>
                <option value="progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </>
          )}
        </div>
        
        <div className="portfolio-grid">
          {filteredPortfolios.length > 0 ? (
            filteredPortfolios.map(item => (
              <div key={item._id} className="portfolio-card">
                <div className="portfolio-image">
                  <img src={item.featuredImage} alt={item.title} />
                  {item.isFeatured && <span className="featured-badge">Featured</span>}
                  {item.projectStatus === 'progress' && <span className="project-status-badge progress">In Progress</span>}
                  {item.projectStatus === 'completed' && <span className="project-status-badge completed">Completed</span>}
                </div>
                <div className="portfolio-details">
                  <h3>{item.title}</h3>
                  <p><strong>Category:</strong> {item.projectType}</p>
                  <p><strong>Client:</strong> {item.client}</p>
                  <p><strong>Date:</strong> {new Date(item.completionDate || item.createdAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {item.projectStatus === 'progress' ? 'In Progress' : 'Completed'}</p>
                </div>
                <div className="portfolio-actions">
                  <button 
                    onClick={() => toggleFeatured(item._id, item.isFeatured)} 
                    className={`btn-feature ${item.isFeatured ? 'featured' : ''}`}
                  >
                    {item.isFeatured ? 'Remove Featured' : 'Set as Featured'}
                  </button>
                  <div className="action-buttons">
                    <Link to={`/dashboard/portfolio/edit/${item._id}`} className="btn-edit">
                      <FaEdit /> Edit
                    </Link>
                    <button onClick={() => handleDelete(item._id)} className="btn-delete">
                      <FaTrash /> Delete
                    </button>
                    <Link to={`/portfolio/${item.slug}`} className="btn-view" target="_blank">
                      <FaEye /> View
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No portfolio items found</div>
          )}
        </div>
        
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => {
              // Show first page, last page, current page, and pages around current page
              const pageNum = i + 1;
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button 
                    key={pageNum}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                (pageNum === currentPage - 2 && currentPage > 3) || 
                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return <span key={pageNum} className="pagination-ellipsis">...</span>;
              }
              return null;
            }).filter(Boolean)}
          </div>
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      </div>
    </div>
  );
}

export default PortfolioManagement;