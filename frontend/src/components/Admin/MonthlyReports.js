import React, { useState } from 'react';
import { FaChartBar, FaFileDownload, FaClock, FaMoneyBillWave, FaCar, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';
import Notification from '../Common/Notification';
import './Admin.css';

const MonthlyReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      showNotification('Please select start and end dates', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/reports/monthly', {
        params: {
          startDate,
          endDate,
          reportType: 'admin'
        }
      });
      
      if (response.data.success) {
        setReportData(response.data);
        showNotification('Report generated successfully!', 'success');
      } else {
        showNotification(response.data.message || 'Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      showNotification('Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async (type) => {
    if (!startDate || !endDate) {
      showNotification('Please select dates first', 'error');
      return;
    }

    try {
      let url = `/reports/export/${type}?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${type}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('CSV downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showNotification('Error downloading CSV', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getMaxValue = (data) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => item.bookings || 0), 1);
  };

  return (
    <div className="page-container">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <FaChartBar style={{ marginRight: '12px', color: '#667eea' }} />
          Monthly Usage Reports
        </h1>
        <p className="page-subtitle">Generate detailed parking utilization reports</p>
      </div>

      {/* Date Range Selector */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Select Report Period</h3>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={generateReport}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <FaChartBar />
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '2px solid #e2e8f0',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => downloadCSV('bookings')}
              className="btn btn-success"
            >
              <FaFileDownload /> Export Bookings CSV
            </button>

            <button
              onClick={() => downloadCSV('slots')}
              className="btn"
              style={{ background: '#4299e1', color: 'white' }}
            >
              <FaFileDownload /> Export Slots CSV
            </button>

            <button
              onClick={() => downloadCSV('summary')}
              className="btn btn-warning"
            >
              <FaFileDownload /> Export Summary CSV
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">
                <FaCar />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{reportData.summary.totalBookings}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <FaMoneyBillWave />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Revenue</div>
                <div className="stat-value">₹{reportData.revenueAnalysis.totalRevenue}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <FaClock />
              </div>
              <div className="stat-content">
                <div className="stat-label">Avg Duration</div>
                <div className="stat-value">{reportData.averageMetrics.averageDurationHours}h</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' }}>
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <div className="stat-label">Completion Rate</div>
                <div className="stat-value">{reportData.summary.completionRate}%</div>
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Peak Hours Analysis</h3>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{
                background: '#ebf4ff',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
                  Peak Hour
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                  {reportData.peakHours.peakHour} ({reportData.peakHours.peakHourBookings} bookings)
                </div>
              </div>

              {/* Time Periods */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(reportData.peakHours.timePeriods).map(([period, count]) => (
                  <div key={period} style={{
                    background: '#f7fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#718096',
                      textTransform: 'uppercase',
                      marginBottom: '8px'
                    }}>
                      {period}
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#2d3748'
                    }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Booking Trend</h3>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                height: '250px',
                overflowX: 'auto'
              }}>
                {reportData.dailyTrend.slice(0, 30).map((day, index) => {
                  const maxBookings = getMaxValue(reportData.dailyTrend);
                  const heightPercent = (day.bookings / maxBookings) * 100;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        flex: '0 0 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {/* Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: `${heightPercent}%`,
                          background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px 4px 0 0',
                          minHeight: day.bookings > 0 ? '20px' : '5px',
                          position: 'relative'
                        }}
                        title={`${day.bookings} bookings on ${day.date}`}
                      >
                        {day.bookings > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#667eea',
                            whiteSpace: 'nowrap'
                          }}>
                            {day.bookings}
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div style={{
                        fontSize: '9px',
                        color: '#718096',
                        transform: 'rotate(-45deg)',
                        whiteSpace: 'nowrap',
                        transformOrigin: 'top left'
                      }}>
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReports;