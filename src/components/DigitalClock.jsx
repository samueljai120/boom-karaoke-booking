import React, { useState, useEffect } from 'react';
import moment from 'moment';

const DigitalClock = ({ 
  className = '', 
  showSeconds = true, 
  showDate = false, 
  showDay = true,
  timezone = 'America/New_York',
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    
    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const timeFormat = showSeconds ? 'h:mm:ss A' : 'h:mm A';
  const timeString = moment(currentTime).tz(timezone).format(timeFormat);
  const dateString = moment(currentTime).tz(timezone).format('MMM D, YYYY');
  const dayString = moment(currentTime).tz(timezone).format('dddd');

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const containerClasses = {
    sm: 'px-2 py-1.5',
    md: 'px-3 py-2.5',
    lg: 'px-4 py-3.5'
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-xl border-2 border-blue-300 fixed top-4 right-4 z-[9999] digital-clock-mobile ${containerClasses[size]} ${className}`}>
      <div className={`font-mono font-bold text-blue-900 ${sizeClasses[size]}`}>
        {timeString}
      </div>
      {showDay && (
        <div className="text-xs text-blue-700 mt-1 font-semibold">
          {dayString}
        </div>
      )}
      {showDate && (
        <div className="text-xs text-blue-600 mt-1 font-medium">
          {dateString}
        </div>
      )}
    </div>
  );
};

export default DigitalClock;
