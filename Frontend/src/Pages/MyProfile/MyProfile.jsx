import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingAPI } from '../../services/api';
import Swal from 'sweetalert2';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  CreditCard, 
  MapPin, 
  LogOut,
  Download,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, filterStatus, bookings]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Get user details
      const storedUser = authAPI.getStoredUser();
      if (!storedUser) {
        navigate('/signin');
        return;
      }

      setUser(storedUser);

      // Get user bookings
      try {
        const bookingsResponse = await bookingAPI.getMyBookings();
        console.log('📦 Bookings loaded:', bookingsResponse);
        
        const bookingsData = bookingsResponse.data || [];
        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (bookingError) {
        console.error('❌ Could not load bookings:', bookingError);
        setBookings([]);
        setFilteredBookings([]);
      }

    } catch (error) {
      console.error('❌ Error loading user data:', error);
      
      if (error.message === 'Invalid or expired token') {
        await Swal.fire({
          icon: 'warning',
          title: 'Session Expired',
          text: 'Please sign in again',
          confirmButtonColor: '#54a15d'
        });
        authAPI.logout();
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => 
        booking.bookingStatus?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.bookingTimestamp) - new Date(a.bookingTimestamp));

    setFilteredBookings(filtered);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#54a15d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Logout'
    });

    if (result.isConfirmed) {
      authAPI.logout();
      await Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully',
        confirmButtonColor: '#54a15d',
        timer: 1500
      });
      navigate('/');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      Swal.fire({
        title: 'Downloading Invoice...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await bookingAPI.downloadInvoice(bookingId);
      
      Swal.close();
      
      await Swal.fire({
        icon: 'success',
        title: 'Invoice Downloaded!',
        text: 'Your invoice has been downloaded successfully.',
        confirmButtonColor: '#54a15d',
        timer: 2000
      });
    } catch (error) {
      console.error('Invoice download error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Unable to download invoice. Please try again.',
        confirmButtonColor: '#54a15d'
      });
    }
  };

  const handleViewBookingDetails = (booking) => {
    const detailsHTML = `
      <div style="text-align: left; max-height: 500px; overflow-y: auto;">
        <h3 style="color: #54a15d; margin-top: 0;">Booking Details</h3>
        
        <div style="margin-bottom: 1rem;">
          <strong>Booking ID:</strong> ${booking.bookingId}<br/>
          <strong>Package:</strong> ${booking.packageName}<br/>
          <strong>Duration:</strong> ${booking.packageInfo?.duration || 'N/A'}<br/>
          <strong>Status:</strong> <span style="color: ${booking.bookingStatus === 'Confirmed' ? '#28a745' : '#ffc107'}">${booking.bookingStatus}</span>
        </div>

        <h4 style="color: #54a15d;">Traveler Information</h4>
        <div style="margin-bottom: 1rem;">
          <strong>Name:</strong> ${booking.userDetails?.name}<br/>
          <strong>Email:</strong> ${booking.userDetails?.email}<br/>
          <strong>Phone:</strong> ${booking.userDetails?.phone}<br/>
          <strong>Number of Travelers:</strong> ${booking.travelers?.length || 0}
        </div>


        <h4 style="color: #54a15d;">Payment Information</h4>
        <div style="margin-bottom: 1rem;">
          <strong>Payment Method:</strong> ${booking.paymentMethod}<br/>
          <strong>Payment Status:</strong> <span style="color: #28a745">${booking.paymentStatus || 'Paid'}</span><br/>
          <strong>Transaction ID:</strong> ${booking.paymentDetails?.transactionId || 'N/A'}<br/>
          <strong>Amount:</strong> ₹${booking.amount?.toLocaleString()}<br/>
          <strong>Total Amount:</strong> <span style="color: #54a15d; font-size: 1.2em;">₹${booking.totalAmount?.toLocaleString()}</span>
        </div>

        ${booking.selectedGuide ? `
          <h4 style="color: #54a15d;">Guide Information</h4>
          <div style="margin-bottom: 1rem;">
            <strong>Name:</strong> ${booking.selectedGuide.name}<br/>
            <strong>Email:</strong> ${booking.selectedGuide.email}<br/>
            ${booking.selectedGuide.phone ? `<strong>Phone:</strong> ${booking.selectedGuide.phone}<br/>` : ''}
          </div>
        ` : ''}

        <h4 style="color: #54a15d;">Booking Timeline</h4>
        <div style="margin-bottom: 1rem;">
          <strong>Booked On:</strong> ${formatDateTime(booking.bookingTimestamp)}<br/>
          ${booking.createdAt ? `<strong>Created:</strong> ${formatDateTime(booking.createdAt)}<br/>` : ''}
          ${booking.invoiceSentAt ? `<strong>Invoice Sent:</strong> ${formatDateTime(booking.invoiceSentAt)}<br/>` : ''}
        </div>
      </div>
    `;

    Swal.fire({
      html: detailsHTML,
      width: 600,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'booking-details-popup'
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': '#28a745',
      'pending': '#ffc107',
      'cancelled': '#dc3545',
      'completed': '#17a2b8'
    };
    return colors[status?.toLowerCase()] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const completedBookings = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'completed').length;

  return (
    <div className="my-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-header-info">
          <h1>{user.name}</h1>
          <p className="user-email">{user.email}</p>
          <span className="member-badge">
            Member since {formatDate(user.createdAt || new Date())}
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Package size={18} />
          My Bookings ({bookings.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="profile-card">
              <h2>Personal Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <User className="info-icon" size={20} />
                  <div className="info-details">
                    <label>Full Name</label>
                    <p>{user.name}</p>
                  </div>
                </div>

                <div className="info-item">
                  <Mail className="info-icon" size={20} />
                  <div className="info-details">
                    <label>Email Address</label>
                    <p>{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="info-item">
                    <Phone className="info-icon" size={20} />
                    <div className="info-details">
                      <label>Phone Number</label>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="info-item">
                  <Calendar className="info-icon" size={20} />
                  <div className="info-details">
                    <label>Member Since</label>
                    <p>{formatDate(user.createdAt || new Date())}</p>
                  </div>
                </div>

                {user.address && (
                  <div className="info-item full-width">
                    <MapPin className="info-icon" size={20} />
                    <div className="info-details">
                      <label>Address</label>
                      <p>
                        {user.address.street && `${user.address.street}, `}
                        {user.address.city && `${user.address.city}, `}
                        {user.address.state && `${user.address.state} `}
                        {user.address.zipCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="account-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Package size={32} color="#54a15d" />
                  </div>
                  <div className="stat-number">{bookings.length}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <CreditCard size={32} color="#54a15d" />
                  </div>
                  <div className="stat-number">₹{totalSpent.toLocaleString()}</div>
                  <div className="stat-label">Total Spent</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <Calendar size={32} color="#54a15d" />
                  </div>
                  <div className="stat-number">{completedBookings}</div>
                  <div className="stat-label">Completed Trips</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            {bookings.length === 0 ? (
              <div className="no-bookings">
                <Package size={64} color="#ccc" />
                <h3>No Bookings Yet</h3>
                <p>Start exploring our packages and make your first booking!</p>
                <button className="explore-btn" onClick={() => navigate('/packages')}>
                  Explore Packages
                </button>
              </div>
            ) : (
              <>
                {/* Search and Filter */}
                <div className="bookings-controls">
                  <div className="search-box">
                    <Search size={20} />
                    <input 
                      type="text" 
                      placeholder="Search by booking ID, package name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-box">
                    <Filter size={20} />
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="bookings-summary">
                  <p>Showing {filteredBookings.length} of {bookings.length} bookings</p>
                </div>

                {/* Bookings Grid */}
                <div className="bookings-grid">
                  {filteredBookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.packageName}</h3>
                        <span 
                          className="status-badge" 
                          style={{ 
                            backgroundColor: `${getStatusColor(booking.bookingStatus)}20`,
                            color: getStatusColor(booking.bookingStatus)
                          }}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>

                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="label">Booking ID:</span>
                          <span className="value booking-id">{booking.bookingId}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Date:</span>
                          <span className="value">{formatDate(booking.bookingTimestamp)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Duration:</span>
                          <span className="value">{booking.packageInfo?.duration || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Travelers:</span>
                          <span className="value">{booking.travelers?.length || 0} Person(s)</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Payment:</span>
                          <span className="value">{booking.paymentMethod}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Payment Status:</span>
                          <span className="value payment-status-paid">
                            ✓ {booking.paymentStatus || 'Paid'}
                          </span>
                        </div>
                        {booking.selectedGuide && (
                          <div className="detail-row">
                            <span className="label">Guide:</span>
                            <span className="value">{booking.selectedGuide.name}</span>
                          </div>
                        )}
                        <div className="detail-row total">
                          <span className="label">Total Amount:</span>
                          <span className="value">₹{booking.totalAmount?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="booking-actions">
                        <button 
                          className="view-btn"
                          onClick={() => handleViewBookingDetails(booking)}
                          title="View Full Details"
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button 
                          className="invoice-btn"
                          onClick={() => handleDownloadInvoice(booking.bookingId)}
                          title="Download Invoice"
                        >
                          <Download size={16} />
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;