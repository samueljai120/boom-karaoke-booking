import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import moment from 'moment';

const DatePicker = ({ selectedDate, onDateChange }) => {
  const today = moment();
  const startOfWeek = moment().startOf('week');
  const endOfWeek = moment().endOf('week');

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const start = startOfWeek.clone();
    
    for (let i = 0; i < 7; i++) {
      const day = start.clone().add(i, 'days');
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const isToday = (date) => {
    return date.isSame(today, 'day');
  };

  const isSelected = (date) => {
    return date.isSame(selectedDate, 'day');
  };

  const isPast = (date) => {
    return date.isBefore(today, 'day');
  };

  const handleDateClick = (date) => {
    if (!isPast(date)) {
      onDateChange(date.toDate());
    }
  };

  const goToToday = () => {
    onDateChange(today.toDate());
  };

  const goToPreviousDay = () => {
    const prevDay = moment(selectedDate).subtract(1, 'day');
    onDateChange(prevDay.toDate());
  };

  const goToNextDay = () => {
    const nextDay = moment(selectedDate).add(1, 'day');
    onDateChange(nextDay.toDate());
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
            className="p-2"
          >
            ←
          </Button>
          
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {moment(selectedDate).format('MMMM YYYY')}
            </div>
            <div className="text-sm text-gray-500">
              {moment(selectedDate).format('dddd, MMM D')}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
            className="p-2"
          >
            →
          </Button>
        </div>

        {/* Today Button */}
        <Button
          variant="secondary"
          onClick={goToToday}
          className="w-full"
        >
          Today
        </Button>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={isPast(day)}
                className={`
                  aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-colors
                  ${isSelected(day)
                    ? 'bg-primary-600 text-white'
                    : isToday(day)
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : isPast(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day.format('D')}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Date Navigation */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Quick Jump
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(today.add(1, 'day').toDate())}
              className="text-xs"
            >
              Tomorrow
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateChange(today.add(7, 'days').toDate())}
              className="text-xs"
            >
              Next Week
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatePicker;
