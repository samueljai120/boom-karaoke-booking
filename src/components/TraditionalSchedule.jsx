import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
import { useTutorial } from '../contexts/TutorialContext';
import moment from 'moment-timezone';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { roomsAPI, bookingsAPI } from '../lib/api';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import DigitalClock from './DigitalClock';
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  Settings, 
  Menu,
  Plus,
  Calendar as CalendarIcon,
  HelpCircle,
  BarChart3,
  Users
} from 'lucide-react';
import BookingModal from './BookingModal';
import InstructionsModal from './InstructionsModal';
import ReservationViewModal from './ReservationViewModal';
import BookingConfirmation from './BookingConfirmation';
import LoadingSkeleton from './LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

// Enhanced draggable booking component with resize functionality (horizontal layout)
const DraggableBooking = ({ booking, children, onDoubleClick, style: customStyle, onClick, onResize, settings, selectedDate, getBusinessHoursForDay, SLOT_WIDTH }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isQuickEdit, setIsQuickEdit] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'left' or 'right'
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [wasDragged, setWasDragged] = useState(false);
  const [wasResized, setWasResized] = useState(false);
  const [localStyle, setLocalStyle] = useState(null); // For real-time resize feedback
  const [resizeInterval] = useState(30); // Fixed at 30 minutes
  const rootRef = React.useRef(null);
  const resizeTimeoutRef = React.useRef(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: booking._id,
    disabled: isResizing || !isQuickEdit, // Drag only in quick edit
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `booking-${booking._id}`,
  });

  const dragStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : customStyle?.zIndex || 10,
  } : {};

  const hoverStyle = isOver && !isResizing ? {
    boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4)',
    borderColor: 'rgb(251, 146, 60)',
    borderWidth: '2px',
  } : {};

  const resizeStyle = isResizing ? {
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    borderColor: 'rgb(59, 130, 246)',
    borderWidth: '2px',
    cursor: 'ew-resize',
  } : {};

  const combinedStyle = { ...customStyle, ...localStyle, ...dragStyle, ...hoverStyle, ...resizeStyle };

  // Suppress accidental click after drag end
  React.useEffect(() => {
    if (isDragging) return;
    if (!isDragging && transform) return;
    setWasDragged(true);
    const t = setTimeout(() => setWasDragged(false), 150);
    return () => clearTimeout(t);
  }, [isDragging]);

  // Handle long press to enter resize mode
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsQuickEdit(true);
      setLongPressTimer(null);
    }, 600);
    setLongPressTimer(timer);
  };

  React.useEffect(() => {
    const cancel = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };
    window.addEventListener('cancel-long-press', cancel);
    return () => {
      window.removeEventListener('cancel-long-press', cancel);
      // Cleanup resize timeout on unmount
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [longPressTimer]);

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Handle resize drag for horizontal layout - set exact time where drag stops
  const handleResizeMouseDown = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    const startX = e.clientX;
    
    // Parse pixel values from strings to numbers
    const parsePixelValue = (value) => {
      if (typeof value === 'string') {
        return parseFloat(value.replace('px', '')) || 0;
      }
      return value || 0;
    };
    
    const startWidth = parsePixelValue(customStyle?.width) || 60;
    const startLeft = parsePixelValue(customStyle?.left) || 0;
    
    // Use the SLOT_WIDTH passed from parent component (calculated with responsive logic)
    // This ensures consistency between positioning and resize calculations
    
    // Get business hours for time calculations
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    const [openHour] = dayHours.openTime.split(':').map(Number);
    const dayStart = moment(selectedDate).startOf('day').add(openHour, 'hours');
    
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      
      // Calculate new visual position based on exact mouse position
      let newLeft = startLeft;
      let newWidth = startWidth;
      
      if (handle === 'left') {
        // Left handle: move left edge and adjust width
        newLeft = startLeft + deltaX;
        newWidth = startWidth - deltaX;
      } else if (handle === 'right') {
        // Right handle: keep left, adjust width
        newWidth = startWidth + deltaX;
      }
      
      // Validate values to prevent NaN and maintain minimum size
      if (isNaN(newLeft) || isNaN(newWidth) || newWidth <= 20 || newLeft < 0) {
        return;
      }
      
      // Apply visual feedback immediately (NO API CALL during drag)
      setLocalStyle({ 
        left: Math.max(0, newLeft), 
        width: Math.max(20, newWidth) 
      });
    };

    const handleMouseUpResize = (upEvent) => {
      // Calculate the exact time where the drag ended using the current mouse position
      const deltaX = upEvent.clientX - startX;
      
      let finalLeft = startLeft;
      let finalWidth = startWidth;
      
      if (handle === 'left') {
        // Left handle: move left edge and adjust width
        finalLeft = startLeft + deltaX;
        finalWidth = startWidth - deltaX;
      } else if (handle === 'right') {
        // Right handle: keep left, adjust width
        finalWidth = startWidth + deltaX;
      }
      
      // Use local style if available (real-time feedback), otherwise use calculated values
      const actualFinalLeft = localStyle?.left !== undefined ? localStyle.left : Math.max(0, finalLeft);
      const actualFinalWidth = localStyle?.width !== undefined ? localStyle.width : Math.max(20, finalWidth);
      
      // Debug logging removed for clean version
      // console.log('🚀 Final resize calculation:', { 
      //   handle, 
      //   actualFinalLeft, 
      //   actualFinalWidth,
      //   SLOT_WIDTH,
      //   deltaX,
      //   startLeft,
      //   startWidth,
      //   localStyle,
      //   upEventClientX: upEvent.clientX,
      //   startX
      // });
      
      // Convert final position to exact time
      onResize?.(booking._id, { 
        handle: handle,
        finalLeft: actualFinalLeft,
        finalWidth: actualFinalWidth,
        SLOT_WIDTH: SLOT_WIDTH,
        dayStart: dayStart.toISOString(),
        isExactPosition: true
      });
      
      setResizeHandle(null);
      setIsResizing(false);
      setLocalStyle(null); // Clear local style when resize ends
      setWasResized(true); // Mark that a resize operation just completed
      
      // Reset wasResized after a longer delay to prevent accidental clicks
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        setWasResized(false);
      }, 300); // Increased delay to 300ms
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUpResize);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUpResize);
  };

  // Exit resize mode on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isResizing) {
          setIsResizing(false);
          setResizeHandle(null);
        }
        if (isQuickEdit) {
          setIsQuickEdit(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isResizing]);

  const dragProps = isResizing ? {} : { ...listeners, ...attributes };

  // Exit quick edit on outside click
  React.useEffect(() => {
    if (!isQuickEdit) return;
    const onDocMouseDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setIsQuickEdit(false);
        setIsResizing(false);
        setResizeHandle(null);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown, true);
    return () => document.removeEventListener('mousedown', onDocMouseDown, true);
  }, [isQuickEdit]);

  // Exit quick edit when drag operation completes
  React.useEffect(() => {
    const handleExitEditMode = () => {
      setIsQuickEdit(false);
    };
    
    window.addEventListener('exit-edit-mode', handleExitEditMode);
    return () => window.removeEventListener('exit-edit-mode', handleExitEditMode);
  }, []);

  const handleRootClick = (e) => {
    // Block clicks during active operations
    if (isResizing || isDragging || isQuickEdit) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Block clicks after drag operations
    if (wasDragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Block clicks immediately after resize operations to prevent accidental triggers
    if (wasResized) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    onClick?.(e);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDropRef(node);
        rootRef.current = node;
      }}
      style={combinedStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={() => onDoubleClick(booking)}
      onClick={handleRootClick}
      className={`absolute top-1 bottom-1 rounded-lg p-2 shadow-sm border text-white text-xs transition-all duration-200 group ${
        isResizing 
          ? 'cursor-ew-resize ring-2 ring-blue-400 shadow-lg scale-105' 
          : isQuickEdit 
            ? 'cursor-move ring-2 ring-blue-400 shadow-lg animate-pulse scale-105' 
            : 'cursor-grab active:cursor-grabbing'
      } ${isOver && !isResizing ? 'ring-2 ring-orange-400 shadow-lg' : ''} ${isDragging ? 'rotate-1 scale-110 shadow-xl' : ''}`}
      title={
        isResizing 
          ? 'Resize mode - drag edges to resize, press Escape to exit' 
          : isOver 
            ? `Drop here to swap with ${booking.customerName}` 
            : `Long press to resize, drag to move ${booking.customerName}`
      }
    >
      {/* Drag area (enabled only in Quick Edit, excludes edges) */}
      {isQuickEdit && (
        <div
          className="absolute inset-1 z-0"
          {...attributes}
          {...listeners}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        />
      )}

      {/* Edit button (appears on hover) */}
      {!isResizing && (
        <button
          type="button"
          className="absolute top-1 right-1 hidden group-hover:flex items-center justify-center w-5 h-5 rounded bg-white/90 text-gray-700 text-[10px]"
          onMouseDown={(e) => { e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
          title="Edit booking"
        >
          ✎
        </button>
      )}
      {/* Left resize handle - enhanced visibility in edit mode */}
      <div
        className={`absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize z-10 transition-all duration-200 ${
          isQuickEdit || isResizing 
            ? 'bg-blue-500/80 hover:bg-blue-500 shadow-lg' 
            : 'bg-transparent hover:bg-blue-500/50'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
        title="Drag to adjust start time"
      >
        {isQuickEdit && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-4 bg-white rounded-full opacity-80"></div>
          </div>
        )}
      </div>

      {/* Right resize handle - enhanced visibility in edit mode */}
      <div
        className={`absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize z-10 transition-all duration-200 ${
          isQuickEdit || isResizing 
            ? 'bg-blue-500/80 hover:bg-blue-500 shadow-lg' 
            : 'bg-transparent hover:bg-blue-500/50'
        }`}
        onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
        title="Drag to adjust end time"
      >
        {isQuickEdit && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-4 bg-white rounded-full opacity-80"></div>
          </div>
        )}
      </div>

      {/* Resize mode indicator */}
      {isResizing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-blue-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">Resize Mode</span>
            <span className="text-blue-200">• 30min intervals • ESC to exit</span>
          </div>
        </div>
      )}

      {/* Edit mode indicator */}
      {isQuickEdit && !isResizing && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span>Edit Mode - Drag edges to resize</span>
          </div>
        </div>
      )}

      {/* Swap indicator */}
      {isOver && !isResizing && (
        <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
          🔄
        </div>
      )}

      {children}
    </div>
  );
};

// Droppable slot component with swap indication
const DroppableSlot = ({ id, children, className, style, onClick, bookings = [], draggedBooking }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  // Simplified visual feedback - just show basic hover states for now
  let backgroundClass = '';
  if (isOver && draggedBooking) {
    backgroundClass = 'bg-blue-100 border-2 border-blue-300';
  } else if (isOver) {
    backgroundClass = 'bg-blue-50';
  }

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${backgroundClass} transition-colors duration-200 relative`}
      style={style}
      onClick={onClick}
      title={draggedBooking && isOver ? 'Drop to place booking' : ''}
    >
      {children}
    </div>
  );
};

const TraditionalSchedule = ({ selectedDate = new Date(2025, 8, 14), onDateChange, onSettingsClick }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Mini calendar month base (independent from selected date)
  const [calendarBaseDate, setCalendarBaseDate] = useState(selectedDate);
  const { settings } = useSettings();
  const { businessHours, getBusinessHoursForDay, getTimeSlotsForDay, isWithinBusinessHours } = useBusinessHours();
  const { showTutorialButton, startTutorial, restartTutorial, tutorialCompleted, tutorialSkipped, isInitialized } = useTutorial();
  
  // Handle tutorial button click
  const handleTutorialClick = () => {
    if (tutorialCompleted || tutorialSkipped) {
      restartTutorial();
    } else {
      startTutorial();
    }
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [draggedBooking, setDraggedBooking] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCustomerBase, setShowCustomerBase] = useState(false);
  const queryClient = useQueryClient();

  // Current time tracking with high frequency updates for smooth movement
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = setInterval(updateTime, 1000); // Update every second for smooth clock-like movement
    return () => clearInterval(interval);
  }, []);

  // Calculate current time position on schedule with enhanced accuracy for smooth movement
  const getCurrentTimePosition = () => {
    const timezone = settings.timezone || 'America/New_York';
    const now = moment().tz(timezone);
    const selectedDateMoment = moment(selectedDate).tz(timezone);
    
    // Check if current time is on the selected date
    if (!now.isSame(selectedDateMoment, 'day')) {
      return null; // Don't show line if not on selected date
    }
    
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    if (dayHours.isClosed) {
      return null; // Don't show line if business is closed
    }
    
    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    // Check if current time is within visible hours (1 hour before open + business hours + 1 hour after close)
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const currentSecond = now.second();
    const currentTimeInMinutes = currentHour * 60 + currentMinute + (currentSecond / 60); // Include seconds for smooth movement
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    // Calculate visible range: 1 hour before open to 1 hour after close
    const visibleStartMinutes = openTimeInMinutes - 60; // 1 hour before open
    const visibleEndMinutes = closeTimeInMinutes + 60; // 1 hour after close
    
    // Handle late night hours (crosses midnight)
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    let isWithinVisibleHours = false;
    if (isLateNight) {
      // Late night: from openHour to closeHour next day + 1 extra hour
      isWithinVisibleHours = currentTimeInMinutes >= visibleStartMinutes || 
                            currentTimeInMinutes < (closeTimeInMinutes + 60) % (24 * 60);
    } else {
      // Normal hours: from 1 hour before open to 1 hour after close same day
      isWithinVisibleHours = currentTimeInMinutes >= visibleStartMinutes && 
                            currentTimeInMinutes <= visibleEndMinutes;
    }
    
    if (!isWithinVisibleHours) {
      return null; // Don't show line if outside visible hours
    }
    
    // Calculate position in minutes from start of visible range (1 hour before business open)
    const dayStart = selectedDateMoment.clone().startOf('day').add(openHour, 'hours').add(openMinute, 'minutes');
    const visibleStart = dayStart.clone().subtract(1, 'hour'); // 1 hour before business open
    const minutesFromVisibleStart = now.diff(visibleStart, 'minutes', true);
    
    // Ensure the position is within the visible range
    const maxVisibleMinutes = (closeTimeInMinutes - openTimeInMinutes) + 120; // Business hours + 2 hours buffer
    const clampedMinutes = Math.max(0, Math.min(minutesFromVisibleStart, maxVisibleMinutes));
    
    return {
      minutesFromStart: clampedMinutes,
      time: now.format('h:mm A'),
      isVisible: true,
      exactTime: now.format('HH:mm:ss'),
      timezone: timezone
    };
  };

  const currentTimeData = getCurrentTimePosition();

  // Calculate which room column the current timeline is in
  const getCurrentTimelineRoomIndex = () => {
    if (!currentTimeData) return null;
    
    // In a traditional schedule layout, the timeline moves across time slots
    // and all rooms share the same time grid. The timeline is always visible
    // across all rooms, so we highlight the first room (index 0) to indicate
    // that the timeline is active in the schedule.
    // 
    // For future layouts with separate room columns, this calculation could be
    // enhanced to determine which specific room column the timeline is over
    // based on the timeline's horizontal position.
    return 0; // Traditional schedule: timeline affects all rooms, highlight first room
  };

  const currentTimelineRoomIndex = getCurrentTimelineRoomIndex();

  // Refs for layout with scroll synchronization
  const leftColumnRef = React.useRef(null);
  const gridScrollRef = React.useRef(null);

  // Scroll synchronization functions
  const syncGridFromLeftColumn = React.useCallback(() => {
    try {
      if (!leftColumnRef.current || !gridScrollRef.current) return;
      if (gridScrollRef.current.scrollTop !== leftColumnRef.current.scrollTop) {
        gridScrollRef.current.scrollTop = leftColumnRef.current.scrollTop;
      }
    } catch {}
  }, []);

  const syncLeftColumnFromGrid = React.useCallback(() => {
    try {
      if (!leftColumnRef.current || !gridScrollRef.current) return;
      if (leftColumnRef.current.scrollTop !== gridScrollRef.current.scrollTop) {
        leftColumnRef.current.scrollTop = gridScrollRef.current.scrollTop;
      }
    } catch {}
  }, []);

  // Configure drag sensors with better activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
        delay: 0,
        tolerance: 2,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Fetch rooms with optimized settings
  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch bookings for selected date with optimized settings
  const { data: bookingsData, isFetching: bookingsFetching, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings', selectedDate],
    queryFn: async () => {
      const result = await bookingsAPI.getAll({ date: selectedDate });
      return result;
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const rooms = roomsData?.data || [];
  const bookings = bookingsData?.data?.bookings || bookingsData?.data || [];

  // Mutation for moving bookings with optimistic update
  const moveBookingMutation = useMutation({
    mutationFn: (data) => {
      return bookingsAPI.move(data);
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      const previous = queryClient.getQueryData(['bookings']);
      try {
        const oldBookings = previous?.data?.bookings || [];
        const { bookingId, newRoomId, newTimeIn, newTimeOut, targetBookingId, targetRoomId, targetNewTimeIn, targetNewTimeOut } = variables || {};
        const sourceIdx = oldBookings.findIndex(b => b._id === bookingId);
        const targetIdx = targetBookingId ? oldBookings.findIndex(b => b._id === targetBookingId) : -1;
        if (sourceIdx === -1) return { previous };
        const source = oldBookings[sourceIdx];
        const target = targetIdx !== -1 ? oldBookings[targetIdx] : null;
        const newRoom = rooms.find(r => r._id === newRoomId || r.id === newRoomId) || source.room || source.roomId;
        const targetRoom = targetRoomId ? rooms.find(r => r._id === targetRoomId || r.id === targetRoomId) : (source.room || source.roomId);
        
        let updated = [...oldBookings];
        if (target && targetBookingId) {
          // Swap: use the provided target times and rooms
          const sourceNew = {
            ...source,
            room: newRoom,
            roomId: newRoom || newRoomId, // Use room object if available, otherwise use ID
            timeIn: newTimeIn,
            timeOut: newTimeOut,
            startTime: newTimeIn,
            endTime: newTimeOut,
          };
          const targetNew = {
            ...target,
            room: targetRoom,
            roomId: targetRoom || targetRoomId, // Use room object if available, otherwise use ID
            timeIn: targetNewTimeIn,
            timeOut: targetNewTimeOut,
            startTime: targetNewTimeIn,
            endTime: targetNewTimeOut,
          };
          updated[sourceIdx] = sourceNew;
          updated[targetIdx] = targetNew;
        } else {
          updated[sourceIdx] = {
            ...source,
            room: newRoom,
            roomId: newRoom || newRoomId, // Use room object if available, otherwise use ID
            timeIn: newTimeIn,
            timeOut: newTimeOut,
            startTime: newTimeIn,
            endTime: newTimeOut,
          };
        }
        queryClient.setQueryData(['bookings'], (old) => ({
          ...(old || {}),
          data: {
            ...((old || {}).data || {}),
            bookings: updated,
          },
        }));
      } catch (e) {
        // Optimistic update failed - silently continue
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['bookings'], context.previous);
      }
      try {
        const message = _err?.response?.data?.message || _err?.response?.data?.error || 'Failed to move booking';
        toast.error(message);
      } catch {}
    },
    onSuccess: (data, variables) => {
      toast.success(variables?.targetBookingId ? 'Booking swapped' : 'Booking moved');
      // Invalidate queries to ensure data consistency with server
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onSettled: () => {
      // Additional cleanup if needed
    },
  });

  // Mutation for updating bookings
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }) => bookingsAPI.update(id, data),
    onSuccess: () => {
      // Invalidate queries to ensure data consistency with server
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Mutation for resizing bookings with optimistic update
  const resizeBookingMutation = useMutation({
    mutationFn: (data) => {
      // Debug logging removed for clean version
      // console.log('🔄 Resize mutation called with data:', data);
      return bookingsAPI.resize(data);
    },
    onMutate: async (variables) => {
      // Debug logging removed for clean version
      // console.log('🔄 Resize mutation onMutate called with variables:', variables);
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      const previous = queryClient.getQueryData(['bookings']);
      try {
        const oldBookings = previous?.data?.bookings || [];
        const { bookingId, newStartTime, newEndTime } = variables || {};
        const idx = oldBookings.findIndex(b => b._id === bookingId);
        if (idx === -1) return { previous };
        const updated = [...oldBookings];
        const current = updated[idx];
        updated[idx] = {
          ...current,
          timeIn: newStartTime,
          timeOut: newEndTime,
          startTime: newStartTime,
          endTime: newEndTime,
        };
        queryClient.setQueryData(['bookings'], (old) => ({
          ...(old || {}),
          data: {
            ...((old || {}).data || {}),
            bookings: updated,
          },
        }));
      } catch (e) {
        // Optimistic update failed - silently continue
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Resize mutation failed - error handling removed for clean version
      if (context?.previous) {
        queryClient.setQueryData(['bookings'], context.previous);
      }
      try {
        const message = _err?.response?.data?.message || _err?.response?.data?.error || 'Failed to resize booking';
        toast.error(message);
      } catch {}
    },
    onSuccess: (data, variables) => {
      // Debug logging removed for clean version
      // console.log('✅ Resize mutation succeeded:', { data, variables });
      toast.success('Booking resized');
    },
    onSettled: () => {
      // Invalidate and refetch bookings to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: (id) => bookingsAPI.delete(id),
    onSuccess: () => {
      toast.success('Booking deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete booking');
    },
  });

  const normalizedBookings = useMemo(() => {
    const mapped = bookings.map(b => ({
      ...b,
      roomId: b.roomId || b.room,
      room: b.room || b.roomId,
      startTime: b.startTime || b.timeIn,
      endTime: b.endTime || b.timeOut,
      timeIn: b.timeIn || b.startTime,
      timeOut: b.timeOut || b.endTime,
    }));

    // Filter bookings that overlap with the selected date
    const selectedStart = moment(selectedDate).startOf('day');
    const selectedEnd = moment(selectedDate).endOf('day');
    
    return mapped.filter(b => {
      const bookingStart = moment(b.startTime || b.timeIn);
      const bookingEnd = moment(b.endTime || b.timeOut);
      
      // Check if booking overlaps with selected date
      return bookingStart.isBefore(selectedEnd) && bookingEnd.isAfter(selectedStart);
    });
  }, [bookings, selectedDate]);


  // Only show big skeleton initially; while refetching, keep previous data
  const initialRoomsLoaded = !!roomsData?.data;
  const isLoading = roomsLoading && !initialRoomsLoaded;
  const hasError = roomsError || bookingsError;
  

  // Get room type color
  const getRoomTypeColor = (type) => {
    const colors = {
      medium: '#3B82F6',
      large: '#10B981',
      party: '#F59E0B',
    };
    return colors[type] || '#3B82F6';
  };

  // Generate time slots using business hours from API
  const timeSlots = useMemo(() => {
    const timezone = settings.timezone || 'America/New_York';
    const slots = [];
    
    // Get business hours for the selected date
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    
    if (dayHours.isClosed) {
      return [];
    }
    
    // Parse open and close times
    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    // console.log (removed for clean version)('🕒 TraditionalSchedule: Parsed times:', {
    //   openTime: dayHours.openTime,
    //   closeTime: dayHours.closeTime,
    //   openHour,
    //   openMinute,
    //   closeHour,
    //   closeMinute
    // });
    
    // Check if this is late night hours (close time is next day)
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    
    // Construct midnight of the selected date in the selected timezone
    const dateInTz = moment.tz(
      {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate(),
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      },
      timezone
    );
    
    // Generate time slots using configurable interval: 1 hour before open + business hours + 1 hour after close
    const timeInterval = settings.timeInterval || 15; // Default to 15 minutes if not set
    let currentMinutes = (openHour * 60 + openMinute) - 60; // Start 1 hour before business open
    const closeMinutes = closeHour * 60 + closeMinute;
    
    // Handle late night hours properly
    let maxVisibleMinutes;
    if (isLateNight) {
      // For late night hours, close time is next day, so add 24 hours
      maxVisibleMinutes = closeMinutes + (24 * 60) + 60; // Close time next day + 1 extra hour
    } else {
      // For normal hours, close time is same day
      maxVisibleMinutes = closeMinutes + 60; // Close time + 1 extra hour
    }
    
    const maxSlots = 200; // Prevent infinite loops (200 slots = 50 hours max)
    
    
    while (slots.length < maxSlots && currentMinutes < maxVisibleMinutes) {
      // Calculate the actual hour and minute for display
      const displayHour = Math.floor(currentMinutes / 60) % 24;
      const displayMinute = currentMinutes % 60;
      const timeString = `${displayHour.toString().padStart(2, '0')}:${displayMinute.toString().padStart(2, '0')}`;
      
      // Create slot time for the current slot
      const slotTime = dateInTz.clone().add(Math.floor(currentMinutes / 60), 'hours').add(displayMinute, 'minutes');
      
      slots.push({
        time: slotTime.format('h:mm A'),
        hour: Math.floor(currentMinutes / 60),
        minute: displayMinute,
        minutes: currentMinutes,
        slotTime,
        timeString,
        isNextDay: currentMinutes >= 24 * 60
      });
      
      currentMinutes += timeInterval; // Generate slots using configurable interval
    }
    
    // Ensure we have exactly the close time and one hour after (if not already included)
    let closeSlotTime, oneHourAfterClose;
    
    if (isLateNight) {
      // For late night hours, close time is next day
      closeSlotTime = dateInTz.clone().add(1, 'day').add(closeHour, 'hours').add(closeMinute, 'minutes');
      oneHourAfterClose = closeSlotTime.clone().add(1, 'hour');
    } else {
      // For normal hours, close time is same day
      closeSlotTime = dateInTz.clone().add(closeHour, 'hours').add(closeMinute, 'minutes');
      oneHourAfterClose = closeSlotTime.clone().add(1, 'hour');
    }
    
    // Add close time if not already included
    const hasCloseTime = slots.some(slot => {
      if (isLateNight) {
        // For late night, check if it's the next day close time
        return slot.isNextDay && slot.hour === closeHour && slot.minute === closeMinute;
      } else {
        // For normal hours, check same day
        return !slot.isNextDay && slot.hour === closeHour && slot.minute === closeMinute;
      }
    });
    
    if (!hasCloseTime) {
      slots.push({
        time: closeSlotTime.format('h:mm A'),
        hour: closeHour,
        minute: closeMinute,
        minutes: closeHour * 60 + closeMinute + (isLateNight ? 24 * 60 : 0),
        slotTime: closeSlotTime,
        timeString: `${closeHour.toString().padStart(2, '0')}:${closeMinute.toString().padStart(2, '0')}`,
        isNextDay: isLateNight
      });
    }
    
    // Add exactly one hour after close time if not already included
    const oneHourAfterCloseHour = oneHourAfterClose.hour();
    const oneHourAfterCloseMinute = oneHourAfterClose.minute();
    const isOneHourAfterNextDay = isLateNight || oneHourAfterCloseHour === 0;
    
    const hasOneHourAfter = slots.some(slot => 
      slot.hour === oneHourAfterCloseHour && slot.minute === oneHourAfterCloseMinute && slot.isNextDay === isOneHourAfterNextDay
    );
    
    if (!hasOneHourAfter) {
      slots.push({
        time: oneHourAfterClose.format('h:mm A'),
        hour: oneHourAfterCloseHour,
        minute: oneHourAfterCloseMinute,
        minutes: oneHourAfterCloseHour * 60 + oneHourAfterCloseMinute + (isOneHourAfterNextDay ? 24 * 60 : 0),
        slotTime: oneHourAfterClose,
        timeString: `${oneHourAfterCloseHour.toString().padStart(2, '0')}:${oneHourAfterCloseMinute.toString().padStart(2, '0')}`,
        isNextDay: isOneHourAfterNextDay
      });
    }
    
    // Time slots generated
    
    
    return slots;
  }, [getBusinessHoursForDay, settings.timezone, settings.timeInterval, selectedDate, businessHours]);

  // Calculate consistent slot dimensions based on settings
  // Enhanced slot size mapping with more options
  const widthMap = {
    'tiny': 20,
    'small': 40,
    'medium': 60,
    'large': 80,
    'huge': 100
  };
  const heightMap = {
    'tiny': 50,
    'small': 70,
    'medium': 90,
    'large': 130,
    'huge': 160
  };
  
  // Use custom width if available, otherwise fall back to preset width
  const customWidth = settings?.horizontalLayoutSlots?.customWidth;
  const baseSlotWidth = customWidth || widthMap[settings?.horizontalLayoutSlots?.slotWidth] || 60;
  // Use custom height if available, otherwise fall back to mapped height
  const customHeight = settings?.horizontalLayoutSlots?.customHeight;
  const baseSlotHeight = customHeight || heightMap[settings?.horizontalLayoutSlots?.slotHeight] || 90;
  // When using custom width, don't apply scale factor - use the custom value directly
  const widthScaleFactor = customWidth ? 1.0 : (settings?.horizontalLayoutSlots?.widthScaleFactor || 0.4);
  // When using custom height, don't apply scale factor - use the custom value directly
  const heightScaleFactor = customHeight ? 1.0 : (settings?.horizontalLayoutSlots?.heightScaleFactor || 1.0);
  
  // Calculate responsive slot dimensions
  const getResponsiveSlotWidth = () => {
    // If custom width is set, use it directly (respect user's choice)
    if (customWidth) {
      return Math.max(1, customWidth);
    }
    
    const minWidth = Math.max(1, baseSlotWidth * widthScaleFactor);
    
    // Calculate available width for time slots
    const availableWidth = (typeof window !== 'undefined' ? window.innerWidth : 1200) - 200; // Account for room column and padding
    const timeSlotsCount = timeSlots.length;
    
    if (timeSlotsCount === 0) {
      return minWidth;
    }
    
    // Calculate optimal width based on available space
    const optimalWidth = availableWidth / timeSlotsCount;
    
    // For tiny/small settings, allow more compression
    const compressionThreshold = settings.horizontalLayoutSlots?.slotWidth === 'tiny' ? 0.6 : 
                                 settings.horizontalLayoutSlots?.slotWidth === 'small' ? 0.7 : 0.8;
    
    const finalWidth = Math.max(
      minWidth, 
      Math.round(optimalWidth * compressionThreshold)
    );
    
    return finalWidth;
  };
  const getResponsiveSlotHeight = () => {
    // If custom height is set, use it directly (respect user's choice)
    if (customHeight) {
      return Math.max(1, customHeight);
    }
    
    const minHeight = Math.max(1, baseSlotHeight * heightScaleFactor);
    
    // Calculate available height for room rows
    const availableHeight = (typeof window !== 'undefined' ? window.innerHeight : 800) - 200; // Account for headers and padding
    const roomsCount = rooms.length;
    
    if (roomsCount === 0) {
      return minHeight;
    }
    
    // Calculate optimal height based on available space
    const optimalHeight = availableHeight / roomsCount;
    
    // For smaller heights, allow more compression
    const compressionThreshold = baseSlotHeight <= 50 ? 0.6 : 
                                baseSlotHeight <= 80 ? 0.7 : 0.8;
    
    // Use the larger of: user preference or calculated optimal height (with compression)
    const finalHeight = Math.max(
      minHeight, 
      Math.round(optimalHeight * compressionThreshold)
    );
    
    return finalHeight;
  };

  const SLOT_WIDTH = getResponsiveSlotWidth();
  const SLOT_HEIGHT = getResponsiveSlotHeight();
  
  // Slot dimensions calculated

  // Group bookings by room and calculate positions
  const bookingsByRoom = useMemo(() => {
    const grouped = {};
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    const [openHour] = dayHours.openTime.split(':').map(Number);
    
    rooms.forEach(room => {
      const roomId = room._id || room.id;
      grouped[roomId] = normalizedBookings
        .filter(booking => {
          // Improved room matching logic - handle both object and ID cases
          let bookingRoomId;
          if (typeof booking.roomId === 'object' && booking.roomId !== null) {
            // roomId is an object, get the _id or id
            bookingRoomId = booking.roomId._id || booking.roomId.id;
          } else if (typeof booking.room === 'object' && booking.room !== null) {
            // room is an object, get the _id or id
            bookingRoomId = booking.room._id || booking.room.id;
          } else {
            // roomId or room is a primitive value
            bookingRoomId = booking.roomId || booking.room;
          }
          
          const roomMatch = bookingRoomId === roomId;
          const statusMatch = booking.status !== 'cancelled' && booking.status !== 'no_show';
          
          return roomMatch && statusMatch;
        })
        .map(booking => {
          // ULTRA-SIMPLE APPROACH: Manual timezone handling
          const timezone = settings.timezone || 'America/New_York';
          
          // Parse booking times and convert to local timezone
          const startTime = moment(booking.startTime || booking.timeIn).tz(timezone);
          const endTime = moment(booking.endTime || booking.timeOut).tz(timezone);
          
          // Create business day start (6 PM = 18:00) at midnight of selected date in the selected timezone
          const dateInTz = moment.tz(
            {
              year: selectedDate.getFullYear(),
              month: selectedDate.getMonth(),
              day: selectedDate.getDate(),
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            },
            timezone
          );
          const businessDayStart = dateInTz.clone().add(openHour, 'hours');
          
          // Calculate exact position and duration from business start with maximum precision
          const startMinutesFromBusinessStart = startTime.diff(businessDayStart, 'minutes', true);
          const endMinutesFromBusinessStart = endTime.diff(businessDayStart, 'minutes', true);
          
          // Calculate exact duration in minutes, then convert to hours for pixel calculation
          const exactDurationMinutes = endMinutesFromBusinessStart - startMinutesFromBusinessStart;
          const exactDurationHours = exactDurationMinutes / 60;
          
          // Use configurable time interval for slot calculations
          const timeInterval = settings.timeInterval || 15;
          
          // Clamp to visible hours: 1 hour before open + business hours + 1 hour after close
          const visibleStartMinutes = Math.max(-60, startMinutesFromBusinessStart); // -60 = 1 hour before open
          const [closeHour] = dayHours.closeTime.split(':').map(Number);
          // Include one extra hour after close time
          const maxVisibleMinutes = ((closeHour - openHour) * 60) + 60; // +60 minutes = 1 extra hour
          const visibleEndMinutes = Math.min(maxVisibleMinutes, endMinutesFromBusinessStart);
          const visibleDurationMinutes = visibleEndMinutes - visibleStartMinutes;
          const visibleDurationHours = visibleDurationMinutes / 60;
          const visibleStartHours = visibleStartMinutes / 60;
          
          if (visibleDurationHours <= 0) {
            return null; // outside visible range
          }
          
          // CORRECT PIXEL CALCULATION
          // Convert to time interval slots for consistent grid alignment
          const minutesPerSlot = timeInterval; // Each slot represents configurable minutes
          const slotsPerHour = 60 / minutesPerSlot; // Calculate slots per hour based on interval
          
          // Calculate precise pixel positions based on actual time, not slot boundaries
          // Adjust for the 1-hour offset before business open
          const adjustedStartMinutes = visibleStartMinutes + 60; // Add 60 minutes to account for 1 hour before open
          
          // Calculate precise pixel positions based on actual time
          const leftPixels = (adjustedStartMinutes / timeInterval) * SLOT_WIDTH;
          const widthPixels = (visibleDurationMinutes / timeInterval) * SLOT_WIDTH;
          
          // Booking positioning calculated

          return {
            ...booking,
            startHours: visibleStartHours,
            endHours: visibleStartHours + visibleDurationHours,
            durationHours: visibleDurationHours,
            leftPixels,
            widthPixels,
          };
        })
        .filter(Boolean);
    });
    return grouped;
  }, [rooms, normalizedBookings, selectedDate, getBusinessHoursForDay, SLOT_WIDTH, businessHours]);

  // Handle date navigation for main schedule
  const navigateDate = (direction) => {
    const newDate = moment(selectedDate).add(direction, 'day');
    onDateChange(newDate.toDate());
  };

  // Mini calendar month navigation only
  const navigateMonth = (direction) => {
    const next = moment(calendarBaseDate).add(direction, 'month').toDate();
    setCalendarBaseDate(next);
  };

  // Handle room slot click
  const handleRoomSlotClick = (room, timeSlot) => {
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    // Check if business is closed
    if (dayHours.isClosed) {
      toast.error('Business is closed on this date. Please choose a different date.');
      return;
    }
    
    // Use the slotTime directly from the timeSlot object, which is already timezone-aware
    const startTime = timeSlot.slotTime.clone();
    const endTime = startTime.clone().add(1, 'hour');
    
    // Validate that the selected time is within business hours
    if (!isWithinBusinessHours(selectedDate, startTime.toDate(), endTime.toDate())) {
      toast.error('Selected time is outside business hours. Please choose a different time.');
      return;
    }
    
    setSelectedBooking({
      start: startTime.toDate(),
      end: endTime.toDate(),
      resource: {
        roomId: room._id || room.id,
        roomName: room.name || 'Unnamed Room',
        roomType: room.category,
        capacity: room.capacity,
      },
    });
    setIsModalOpen(true);
  };

  // Handle booking click - show read-only view first
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Handle confirmation modal close
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedBooking(null);
  };

  // Handle no show
  const handleNoShow = async (booking) => {
    try {
      await updateBookingMutation.mutateAsync({
        id: booking._id,
        data: { status: 'no_show' }
      });
      setIsViewModalOpen(false);
    } catch (error) {
      // Failed to mark as no show - error handling removed for clean version
    }
  };

  // Handle edit from view modal
  const handleEditBooking = (booking) => {
    setSelectedBooking({
      id: booking._id,
      title: booking.customerName,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: {
        roomId: booking.room?._id || booking.roomId?._id,
        roomName: booking.room?.name || booking.roomId?.name,
        roomType: booking.room?.type || booking.roomId?.type,
        capacity: booking.room?.capacity || booking.roomId?.capacity,
        color: booking.room?.color || booking.roomId?.color,
        phone: booking.phone,
        source: booking.source,
        notes: booking.notes,
        duration: booking.durationMinutes,
      },
    });
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  // Keep mini calendar in sync when selected date changes elsewhere
  React.useEffect(() => {
    setCalendarBaseDate(selectedDate);
  }, [selectedDate]);

  // Helper function to find booking conflicts
  const findBookingConflicts = (roomId, startTime, endTime, excludeBookingId = null) => {
    return normalizedBookings.filter(b => {
      if (b._id === excludeBookingId) return false;
      const bookingRoomId = b.room?._id || b.roomId?._id || b.room?.id || b.roomId?.id || b.roomId;
      if (bookingRoomId !== roomId) return false;
      
      const bStart = moment(b.startTime || b.timeIn);
      const bEnd = moment(b.endTime || b.timeOut);
      const newStart = moment(startTime);
      const newEnd = moment(endTime);
      
      // Check for overlap
      return newStart.isBefore(bEnd) && newEnd.isAfter(bStart);
    });
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const booking = normalizedBookings.find(b => b._id === active.id);
    setActiveId(active.id);
    setDraggedBooking(booking);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedBooking(null);

    if (!over) {
      // Exit edit mode when drag is cancelled (dropped outside valid area)
      window.dispatchEvent(new CustomEvent('exit-edit-mode'));
      return;
    }

    const overId = String(over.id);
    const booking = normalizedBookings.find(b => b._id === active.id);
    
    if (!booking) return;

    if (overId.startsWith('slot-')) {
      const rest = overId.slice('slot-'.length);
      const lastDash = rest.lastIndexOf('-');
      if (lastDash === -1) return;
      const roomId = parseInt(rest.slice(0, lastDash));
      const timeSlotIndex = rest.slice(lastDash + 1);
      // Calculate new time slot for horizontal view
      const weekday = selectedDate.getDay();
      const dayHours = getBusinessHoursForDay(weekday);
      const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
      
      // Convert slot index to actual time (each slot is configurable minutes)
      const timeInterval = settings.timeInterval || 15; // Use configurable time interval
      const slotIndex = parseInt(timeSlotIndex);
      
      // Get the actual time slot from the generated timeSlots array
      const targetSlot = timeSlots[slotIndex];
      if (!targetSlot) {
        // Target slot not found - silently continue
        return;
      }
      
      // Use the slot's actual time instead of calculating from index
      // TraditionalSchedule starts 1 hour before business open, so we need to use the slot's actual time
      const slotHour = targetSlot.hour;
      const slotMinute = targetSlot.minute;
      
      const dayStart = moment(selectedDate).startOf('day');
      const newTimeIn = dayStart.clone().add(slotHour, 'hours').add(slotMinute, 'minutes').toISOString();
      const duration = moment(booking.timeOut || booking.endTime).diff(moment(booking.timeIn || booking.startTime), 'minutes', true);
      const newTimeOut = dayStart.clone().add(slotHour, 'hours').add(slotMinute, 'minutes').add(duration, 'minutes').toISOString();

      // Check if dropping on different room or time
      const currentRoomId = booking.room?._id || booking.roomId?._id || booking.room?.id || booking.roomId?.id || booking.roomId;
      const currentStartTime = moment(booking.timeIn || booking.startTime);
      const isSamePosition = currentRoomId === roomId && 
        currentStartTime.hour() === slotHour && 
        currentStartTime.minute() === slotMinute;

      if (!isSamePosition) {
        // Check for conflicts in the target position
        const conflicts = findBookingConflicts(roomId, newTimeIn, newTimeOut, booking._id);
        
        if (conflicts.length === 1) {
          // Single conflict - perform swap
          const targetBooking = conflicts[0];
          // Debug logging removed for clean version
          // console.log('🔄 Swapping bookings:', booking.customerName, '↔', targetBooking.customerName);
          
          // Calculate the target booking's new time (swap the start times)
          const targetDuration = moment(targetBooking.timeOut || targetBooking.endTime).diff(moment(targetBooking.timeIn || targetBooking.startTime), 'minutes', true);
          const sourceDuration = moment(booking.timeOut || booking.endTime).diff(moment(booking.timeIn || booking.startTime), 'minutes', true);
          
          // For swap: 
          // - Source gets the dropped slot time (already calculated as newTimeIn/newTimeOut)
          // - Target gets the source's original time slot (same day, same time as source's original)
          const sourceOriginalTime = moment(booking.timeIn || booking.startTime);
          const targetNewTimeIn = dayStart.clone()
            .add(sourceOriginalTime.hour(), 'hours')
            .add(sourceOriginalTime.minute(), 'minutes')
            .toISOString();
          const targetNewTimeOut = moment(targetNewTimeIn).add(targetDuration, 'minutes').toISOString();
          
          // Get target room ID (source's original room)
          const targetRoomId = booking.room?._id || booking.roomId?._id || booking.roomId;
          
          moveBookingMutation.mutate({
            bookingId: booking._id,
            newRoomId: roomId,
            newTimeIn,
            newTimeOut,
            targetBookingId: targetBooking._id,
            targetRoomId: targetRoomId,
            targetNewTimeIn,
            targetNewTimeOut
          });
          
          // Exit edit mode after successful swap
          window.dispatchEvent(new CustomEvent('exit-edit-mode'));
        } else if (conflicts.length === 0) {
          // No conflicts - simple move
          // Debug logging removed for clean version
          // console.log('📍 Moving booking:', booking.customerName, 'to new position');
          moveBookingMutation.mutate({
            bookingId: booking._id,
            newRoomId: roomId,
            newTimeIn,
            newTimeOut,
          });
          
          // Exit edit mode after successful move
          window.dispatchEvent(new CustomEvent('exit-edit-mode'));
        } else {
          // Multiple conflicts - show error
          // Multiple booking conflicts detected
          toast.error('Cannot place booking here: Multiple conflicting reservations detected.');
        }
      }
    } else if (overId.startsWith('booking-')) {
      // Handle direct booking-to-booking swap
      const targetId = overId.slice('booking-'.length);
      const targetBooking = normalizedBookings.find(b => b._id === targetId);
      if (targetBooking && targetBooking._id !== booking._id) {
        const targetRoomId = targetBooking.room?._id || targetBooking.roomId?._id || targetBooking.room?.id || targetBooking.roomId?.id || targetBooking.roomId;
        const sourceRoomId = booking.room?._id || booking.roomId?._id || booking.room?.id || booking.roomId?.id || booking.roomId;
        
        // Debug logging removed for clean version
        // console.log('🔄 Direct swap:', booking.customerName, '↔', targetBooking.customerName);
        moveBookingMutation.mutate({
          bookingId: booking._id,
          newRoomId: targetRoomId,
          newTimeIn: targetBooking.timeIn || targetBooking.startTime,
          newTimeOut: targetBooking.timeOut || targetBooking.endTime,
          targetBookingId: targetBooking._id,
          targetRoomId: sourceRoomId,
          targetNewTimeIn: booking.timeIn || booking.startTime,
          targetNewTimeOut: booking.timeOut || booking.endTime,
        });
        
        // Exit edit mode after successful direct swap
        window.dispatchEvent(new CustomEvent('exit-edit-mode'));
      }
    }
  };

  // Handle booking resize for horizontal layout - exact position where drag stops
  const handleBookingResize = (bookingId, resizeData) => {
    const { left, width, handle, intervalMinutes, intervalDirection, finalLeft, finalWidth, SLOT_WIDTH: slotWidth, dayStart: dayStartTime, isExactPosition } = resizeData;
    const booking = normalizedBookings.find(b => b._id === bookingId);
    if (!booking) return;

    // If we have exact position data, use that for precise time calculations
    if (isExactPosition && finalLeft !== undefined && finalWidth !== undefined) {
      const dayStartMoment = moment(dayStartTime);
      
      let newStartTime, newEndTime;
      
      // Get the actual time interval from settings
      const timeInterval = settings.timeInterval || 15;
      
      // Debug logging removed for clean version
      //   timeInterval,
      //   settingsTimeInterval: settings.timeInterval,
      //   is60Minute: timeInterval === 60,
      //   finalLeft,
      //   finalWidth,
      //   slotWidth
      // });
      
      // For 60-minute intervals, allow 30-minute granularity (half-slot precision)
      // For other intervals, use the interval itself
      const resizeSnapInterval = timeInterval === 60 ? 30 : timeInterval;
      
      // Debug logging removed for clean version
      // console.log('🔧 Time calculation inputs:', {
      //   finalLeft,
      //   finalWidth,
      //   slotWidth,
      //   timeInterval,
      //   resizeSnapInterval,
      //   dayStartMoment: dayStartMoment.format('YYYY-MM-DD HH:mm:ss'),
      //   handle
      // });
      
      if (handle === 'left') {
        // Left handle: set new start time based on final position
        // Convert pixels to slot fractions, accounting for 1-hour offset before business hours
        const slotFraction = finalLeft / slotWidth;
        let newStartMinutes = slotFraction * timeInterval - 60; // Subtract 60 minutes for 1-hour offset before open
        
        // Snap to resize interval for better granularity
        newStartMinutes = Math.round(newStartMinutes / resizeSnapInterval) * resizeSnapInterval;
        
        // Ensure the new start time is not after the current end time
        const currentEndTime = moment(booking.endTime || booking.timeOut);
        const proposedStartTime = dayStartMoment.clone().add(newStartMinutes, 'minutes');
        
        if (proposedStartTime.isAfter(currentEndTime)) {
          // If proposed start is after end time, adjust to be 1 hour before end time
          newStartTime = currentEndTime.clone().subtract(1, 'hour').toISOString();
        } else {
          newStartTime = proposedStartTime.toISOString();
        }
        newEndTime = booking.endTime || booking.timeOut; // Keep end time same
        
        // Debug logging removed for clean version
        // console.log('🔧 Left handle calculation:', {
        //   slotFraction,
        //   newStartMinutes,
        //   snappedMinutes: newStartMinutes,
        //   proposedStartTime: proposedStartTime.format('YYYY-MM-DD HH:mm:ss'),
        //   newStartTime,
        //   currentEndTime: currentEndTime.format('YYYY-MM-DD HH:mm:ss'),
        //   originalStartTime: booking.startTime || booking.timeIn,
        //   originalEndTime: booking.endTime || booking.timeOut
        // });
      } else {
        // Right handle: set new end time based on final position
        newStartTime = booking.startTime || booking.timeIn; // Keep start time same
        // Convert pixels to slot fractions, accounting for 1-hour offset before business hours
        const endSlotFraction = (finalLeft + finalWidth) / slotWidth;
        let newEndMinutes = endSlotFraction * timeInterval - 60; // Subtract 60 minutes for 1-hour offset before open
        
        // Snap to resize interval for better granularity
        newEndMinutes = Math.round(newEndMinutes / resizeSnapInterval) * resizeSnapInterval;
        
        // Ensure the new end time is not before the current start time
        const currentStartTime = moment(booking.startTime || booking.timeIn);
        const proposedEndTime = dayStartMoment.clone().add(newEndMinutes, 'minutes');
        
        if (proposedEndTime.isBefore(currentStartTime)) {
          // If proposed end is before start time, adjust to be 1 hour after start time
          newEndTime = currentStartTime.clone().add(1, 'hour').toISOString();
        } else {
          newEndTime = proposedEndTime.toISOString();
        }
        
        // Debug logging removed for clean version
        // console.log('🔧 Right handle calculation:', {
        //   endSlotFraction,
        //   newEndMinutes,
        //   snappedMinutes: newEndMinutes,
        //   proposedEndTime: proposedEndTime.format('YYYY-MM-DD HH:mm:ss'),
        //   newEndTime,
        //   currentStartTime: currentStartTime.format('YYYY-MM-DD HH:mm:ss'),
        //   originalStartTime: booking.startTime || booking.timeIn,
        //   originalEndTime: booking.endTime || booking.timeOut
        // });
      }

      // Debug logging removed for clean version
      // console.log('🚀 Calling exact position resize API with:', {
      //   bookingId,
      //   newStartTime,
      //   newEndTime,
      //   finalLeft,
      //   finalWidth,
      //   slotWidth,
      //   handle,
      //   timeInterval,
      //   originalStartTime: booking.startTime || booking.timeIn,
      //   originalEndTime: booking.endTime || booking.timeOut
      // });

      // Call resize API
      resizeBookingMutation.mutate({
        bookingId,
        newStartTime,
        newEndTime,
      });
      return;
    }

    // Legacy interval-based fallback
    if (intervalMinutes && intervalDirection !== undefined) {
      const currentStart = moment(booking.startTime || booking.timeIn);
      const currentEnd = moment(booking.endTime || booking.timeOut);
      const intervalDuration = moment.duration(intervalMinutes, 'minutes');
      
      let newStartTime, newEndTime;
      
      if (handle === 'left') {
        // Changing start time (left edge) - intervalDirection positive moves start time later, negative moves it earlier
        newStartTime = currentStart.clone().add(intervalDirection * intervalDuration).toISOString();
        newEndTime = currentEnd.toISOString(); // Keep end time same
      } else {
        // Changing end time (right edge) - intervalDirection positive extends duration, negative shortens it
        newStartTime = currentStart.toISOString(); // Keep start time same
        newEndTime = currentEnd.clone().add(intervalDirection * intervalDuration).toISOString();
      }

      // Debug logging removed for clean version
      // console.log('🚀 Calling interval-based resize API with:', {
      //   bookingId,
      //   newStartTime,
      //   newEndTime,
      //   intervalMinutes,
      //   intervalDirection,
      //   handle
      // });

      // Call resize API
      resizeBookingMutation.mutate({
        bookingId,
        newStartTime,
        newEndTime,
      });
      return;
    }

    // Fallback to pixel-based calculation for backward compatibility
    const widthMap = {
      'tiny': 20,
      'small': 40,
      'medium': 60,
      'large': 80,
    };
    const customWidth = settings?.horizontalLayoutSlots?.customWidth;
    const baseSlotWidth = customWidth || widthMap[settings?.horizontalLayoutSlots?.slotWidth] || 60;
    const widthScaleFactor = settings?.horizontalLayoutSlots?.widthScaleFactor || 0.4;
    const SLOT_WIDTH = Math.max(1, baseSlotWidth * widthScaleFactor);
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    const [openHour] = dayHours.openTime.split(':').map(Number);
    const dayStart = moment(selectedDate).startOf('day').add(openHour, 'hours');
    
    // Calculate new times based on pixel changes
    const leftHours = left / SLOT_WIDTH;
    const widthHours = width / SLOT_WIDTH;
    
    let newStartTime, newEndTime;
    
    if (handle === 'left') {
      // Changing start time (left edge)
      newStartTime = dayStart.clone().add(leftHours, 'hours').toISOString();
      newEndTime = booking.endTime; // Keep end time same
    } else {
      // Changing end time (right edge)
      newStartTime = booking.startTime; // Keep start time same
      newEndTime = dayStart.clone().add(leftHours + widthHours, 'hours').toISOString();
    }

    // Call resize API
    resizeBookingMutation.mutate({
      bookingId,
      newStartTime,
      newEndTime,
    });
  };

  // Handle double click to resize/expand
  const handleBookingDoubleClick = (booking) => {
    setSelectedBooking({
      id: booking._id,
      title: booking.customerName,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      resource: {
        roomId: booking.room?._id || booking.roomId?._id,
        roomName: booking.room?.name || booking.roomId?.name,
        roomType: booking.room?.type || booking.roomId?.type,
        capacity: booking.room?.capacity || booking.roomId?.capacity,
        color: booking.room?.color || booking.roomId?.color,
        phone: booking.phone,
        source: booking.source,
        notes: booking.notes,
        duration: booking.durationMinutes,
      },
    });
    setIsModalOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return <LoadingSkeleton type="schedule" />;
  }

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load schedule</h3>
          <p className="text-gray-600 mb-4">
            {roomsError ? 'Unable to load rooms' : 'Unable to load bookings'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={(e) => {
          try {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('cancel-long-press'));
            }
          } catch {}
          handleDragStart(e);
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-screen bg-white flex">
          {/* Left Sidebar */}
          <div className={`${sidebarOpen ? 'w-80' : 'w-14'} bg-white border-r border-gray-200 flex flex-col sticky top-0 self-start h-screen`}>
            {/* Header */}
            <div className="p-2 border-b border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} mb-2`}>
            <div className={`flex items-center space-x-2 ${sidebarOpen ? '' : 'hidden'}`}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">♪</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Karaoke Calendar</h1>
            </div>
            <Button variant="ghost" size="icon" className="h-12 w-12 min-h-[48px]" onClick={() => setSidebarOpen(v => !v)} title={sidebarOpen ? 'Collapse' : 'Expand'}>
              <Menu className="w-10 h-10" />
            </Button>
          </div>
          
          {/* Navigation (Dashboard removed) */}
          <nav className={`space-y-2 ${sidebarOpen ? '' : 'hidden'}`}></nav>
        </div>

        {/* Mini Calendar */}
        <div className={`p-6 flex-1 overflow-hidden ${sidebarOpen ? '' : 'hidden'}`}>
          {/* Today button top-right */}
          <div className="flex items-center justify-end mb-1">
            <Button 
              variant="ghost" 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDateChange(new Date());
              }}
            >
              Today
            </Button>
          </div>
          {/* Centered header with arrows + month */}
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth(-1);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="min-w-[140px] text-center text-lg font-semibold text-gray-900 select-none">
                {moment(calendarBaseDate).format('MMMM YYYY')}
              </div>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth(1);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                const startOfMonth = moment(calendarBaseDate).startOf('month');
                const endOfMonth = moment(calendarBaseDate).endOf('month');
                const startOfCalendar = startOfMonth.clone().startOf('week');
                const endOfCalendar = endOfMonth.clone().endOf('week');
                const days = [];
                const cur = startOfCalendar.clone();
                while (cur.isSameOrBefore(endOfCalendar, 'day')) {
                  days.push(cur.clone());
                  cur.add(1, 'day');
                }
                return days;
              })().map((day, i) => {
                const isCurrentMonth = day.isSame(selectedDate, 'month');
                const isToday = day.isSame(moment(), 'day');
                const isSelected = day.isSame(selectedDate, 'day');
                
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const picked = day.toDate();
                      onDateChange(picked);
                      setCalendarBaseDate(picked);
                    }}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isToday ? 'bg-blue-100 text-blue-600' : ''}
                      ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                    `}
                  >
                    {day.format('D')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Booking Source Legend (under mini calendar) */}
          {settings.colorByBookingSource && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Booking Sources</h4>
              <div className="grid grid-cols-2 gap-y-2">
                {Object.entries(settings.bookingSourceColors || {}).map(([key, color]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-700 capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Profile */}
          <div className="mt-8 flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 font-medium">N</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Staff User</p>
              <p className="text-xs text-gray-500">admin@boomkaraoke.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Actions: Analytics + Customer Base + Instructions + Settings */}
        <div className="mt-auto border-t border-gray-200 p-2 space-y-2">
          {sidebarOpen ? (
            <>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowAnalytics(true)}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowCustomerBase(true)}
              >
                <Users className="w-4 h-4 mr-3" />
                Customer Base
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowInstructions(true)}
              >
                <CalendarIcon className="w-4 h-4 mr-3" />
                Instructions
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={onSettingsClick}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12"
                onClick={() => setShowAnalytics(true)}
                title="Analytics"
              >
                <BarChart3 className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12"
                onClick={() => setShowCustomerBase(true)}
                title="Customer Base"
              >
                <Users className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12"
                onClick={() => setShowInstructions(true)}
                title="Instructions"
              >
                <CalendarIcon className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12"
                onClick={onSettingsClick}
                title="Settings"
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="h-12 w-12 [&>svg]:w-8 [&>svg]:h-8" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            </Button>
            <h2 className="text-2xl font-semibold text-gray-900">
              {moment(selectedDate).format('MMMM D, YYYY')}
            </h2>
            <Button variant="ghost" size="icon" className="h-12 w-12 [&>svg]:w-8 [&>svg]:h-8" onClick={() => navigateDate(1)}>
              <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
        
        {/* Fixed Digital Clock */}
        <DigitalClock 
          showSeconds={true} 
          showDate={false} 
          showDay={true}
          size="md"
          className="shadow-xl border-2 border-blue-200 bg-blue-50"
        />

        {/* Timeline Header - At the Top */}
        <div className="relative z-80">
          <div className="flex">
            {/* Empty space for room column alignment */}
            <div className="w-32 sm:w-40 md:w-48 flex-shrink-0"></div>
            
            {/* Timeline Header */}
            <div className="flex-1 relative">
              <table className="border-separate border-spacing-0 w-full" style={{ width: `${timeSlots.length * SLOT_WIDTH}px` }}>
                <thead>
                  <tr>
                    {timeSlots.map((slot, index) => {
                      // Check if this is the current time slot - synchronized with red line
                      const isCurrentTimeSlot = currentTimeData && (() => {
                        const timeInterval = settings.timeInterval || 15;
                        // Use exact same calculation as red line positioning
                        const slotIndex = Math.round(currentTimeData.minutesFromStart / timeInterval);
                        return index === slotIndex;
                      })();
                      
                      return (
                        <th
                          key={index}
                          className={`sticky top-0 z-80 border-r border-b text-center shadow-sm relative transition-all duration-300 ${
                            isCurrentTimeSlot 
                              ? 'bg-gradient-to-b from-red-100 to-red-200 border-red-400 shadow-lg' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          style={{ height: '48px', width: SLOT_WIDTH, minWidth: SLOT_WIDTH }}
                        >
                          {/* Enhanced time label with current time highlighting */}
                          {index > 0 && (
                            <div 
                              className="absolute -left-1/2 top-0 bottom-0 flex items-center justify-center z-90"
                              style={{ width: `${SLOT_WIDTH}px` }}
                            >
                              <span className={`text-xs font-medium px-2 py-1 rounded-lg transition-all duration-300 ${
                                isCurrentTimeSlot 
                                  ? 'bg-red-600 text-white shadow-lg border-2 border-red-400 animate-pulse' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}>
                                {slot.time}
                              </span>
                            </div>
                          )}
                          {/* Show time for first column - same positioning as others */}
                          {index === 0 && (
                            <div 
                              className="absolute -left-1/2 top-0 bottom-0 flex items-center justify-center z-90"
                              style={{ width: `${SLOT_WIDTH}px` }}
                            >
                              <span className={`text-xs font-medium px-2 py-1 rounded-lg transition-all duration-300 ${
                                isCurrentTimeSlot 
                                  ? 'bg-red-600 text-white shadow-lg border-2 border-red-400 animate-pulse' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}>
                                {slot.time}
                              </span>
                            </div>
                          )}
                          
                          {/* Current time indicator dot */}
                          {isCurrentTimeSlot && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>

        {/* Schedule Grid - Traditional Layout */}
        <div className="flex-1 relative max-h-[calc(100vh-250px)] overflow-hidden">
          <div className="flex h-full">
            {/* Sticky First Column - Name Label Column (No Red Light Effect) */}
            <div ref={leftColumnRef} onScroll={syncGridFromLeftColumn} className="border-r border-gray-200 flex-shrink-0 z-20 overflow-y-auto w-32 sm:w-40 md:w-48">
              {/* Room Info Cells Container - Background Color */}
              <div className="bg-gray-50">
                {rooms.map((room, roomIndex) => {
                  return (
                    <div 
                      key={room._id || room.id} 
                      className="border-b border-gray-200 p-3" 
                      style={{ height: SLOT_HEIGHT }}
                    >
                      <div className="flex items-center space-x-2 mb-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: settings.colorByBookingSource ? '#9ca3af' : (room.color || getRoomTypeColor(room.category)) }}
                        />
                        <span className="text-sm font-medium truncate text-gray-900" title={room.name || 'Unnamed Room'}>{room.name || 'Unnamed Room'}</span>
                      </div>
                      <div className="text-xs truncate text-gray-500">
                        {room.category?.charAt(0).toUpperCase() + room.category?.slice(1)} ({room.capacity} max)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Content Area - Synchronized Scroll */}
            <div ref={gridScrollRef} onScroll={syncLeftColumnFromGrid} className="flex-1 overflow-y-auto relative z-60" style={{ marginLeft: '0px' }}>
              {/* Current time vertical line - synchronized with slot highlighting */}
              {currentTimeData && (() => {
                const timeInterval = settings.timeInterval || 15;
                // Use same calculation as slot highlighting for perfect synchronization
                const slotIndex = Math.round(currentTimeData.minutesFromStart / timeInterval);
                const leftPixels = slotIndex * SLOT_WIDTH;
                return (
                  <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-none transition-all duration-1000 ease-linear"
                    style={{ 
                      left: `${leftPixels}px`, 
                      width: '3px',
                      transform: 'translateX(-50%)' // Center the line on the exact time position
                    }}
                  >
                    {/* Clean vertical line with subtle effects */}
                    <div className="relative h-full">
                      {/* Outer glow */}
                      <div className="absolute -left-1 -right-1 top-0 bottom-0 bg-red-400 opacity-30 blur-sm"></div>
                      {/* Main line with gradient */}
                      <div className="w-full h-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 shadow-lg"></div>
                      {/* Inner highlight */}
                      <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20"></div>
                      {/* Animated pulse overlay */}
                      <div className="absolute top-0 left-0 w-full h-full bg-red-300 opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                );
              })()}
              
              <table className="border-separate border-spacing-0" style={{ width: `${timeSlots.length * SLOT_WIDTH}px`, marginLeft: '0px' }}>
                {/* Content Rows */}
                <tbody>
                  {rooms.map((room, roomIndex) => (
                    <tr key={room._id || room.id} className="border-b border-gray-200">
                      {/* Time Slot Cells */}
                      {timeSlots.map((slot, slotIndex) => (
                        <td 
                          key={slotIndex} 
                          className="border-r border-gray-200 relative p-0"
                          style={{ 
                            width: SLOT_WIDTH, 
                            minWidth: SLOT_WIDTH,
                            height: SLOT_HEIGHT 
                          }}
                        >
                          <DroppableSlot
                            id={`slot-${room._id || room.id}-${slotIndex}`}
                            className="w-full h-full hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleRoomSlotClick(room, slot)}
                            bookings={normalizedBookings}
                            draggedBooking={draggedBooking}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Bookings layer - positioned relative to the scrollable container */}
              <div className="absolute" style={{ top: '0px', left: '0', right: '0', bottom: '0', pointerEvents: 'none' }}>
        {rooms.flatMap((room, roomIndex) => {
          const roomId = room._id || room.id;
          const roomBookings = bookingsByRoom[roomId] || [];

          return roomBookings.map((booking) => {
            // Passing SLOT_WIDTH to DraggableBooking
            return (
            <DraggableBooking
              key={`${roomId}-${booking._id || booking.id}`}
              booking={booking}
              onDoubleClick={handleBookingDoubleClick}
              onClick={(e) => {
                e.stopPropagation();
                handleBookingClick(booking);
              }}
              getBusinessHoursForDay={getBusinessHoursForDay}
              onResize={handleBookingResize}
              settings={settings}
              selectedDate={selectedDate}
              SLOT_WIDTH={SLOT_WIDTH}
              style={{
                position: 'absolute',
                left: `${booking.leftPixels}px`,
                width: `${booking.widthPixels}px`,
                top: `${roomIndex * SLOT_HEIGHT}px`, // Align with room row
                height: `${SLOT_HEIGHT}px`, // Full height to match slot
                backgroundColor: settings.colorByBookingSource ? (settings.bookingSourceColors?.[(booking.source || '').toLowerCase() === 'walk_in' ? 'walkin' : (booking.source || '').toLowerCase()] || settings.bookingSourceColors?.online || '#2563eb') : (room.color || getRoomTypeColor(room.category)),
                zIndex: 10,
                pointerEvents: 'auto',
                borderRadius: '4px', // Add rounded corners for better visual appearance
              }}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium truncate pr-1">{booking.customerName || 'Reservation'}</div>
                {booking.notes ? (
                  <span className="ml-1 text-[10px] bg-white/90 text-gray-800 px-1.5 py-0.5 rounded">Note</span>
                ) : null}
              </div>
              <div className="opacity-90 truncate text-[11px]">
                {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
              </div>
              {booking.notes && (
                <div className="mt-1 text-[10px] text-white truncate" title={booking.notes}>
                  {booking.notes}
                </div>
              )}
            </DraggableBooking>
            );
          });
        })}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeId && draggedBooking ? (
          <div className="rounded-lg p-2 shadow-lg border text-white text-xs bg-blue-600">
            <div className="font-medium truncate">{draggedBooking.customerName || 'Reservation'}</div>
            <div className="opacity-90 truncate text-[11px]">
              {moment(draggedBooking.startTime).format('h:mm A')} - {moment(draggedBooking.endTime).format('h:mm A')}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>

    {/* Floating action button: New Booking */}
    <button
      type="button"
      onClick={() => {
        const weekday = selectedDate.getDay();
        const dayHours = getBusinessHoursForDay(weekday);
        
        // Check if business is closed
        if (dayHours.isClosed) {
          toast.error('Business is closed on this date. Please choose a different date.');
          return;
        }
        
        // Set start time to business open time or current time (whichever is later)
        const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
        const businessStart = moment(selectedDate).startOf('day').add(openHour, 'hours').add(openMinute, 'minutes');
        const now = moment();
        const start = now.isAfter(businessStart) ? now.startOf('hour').add(1, 'hour') : businessStart;
        const end = start.clone().add(1, 'hour');
        
        // Validate that the selected time is within business hours
        if (!isWithinBusinessHours(selectedDate, start.toDate(), end.toDate())) {
          toast.error('No available time slots within business hours. Please choose a different date.');
          return;
        }
        
        setSelectedBooking({
          start: start.toDate(),
          end: end.toDate(),
          resource: { roomId: (rooms && rooms[0] && rooms[0]._id) || undefined },
        });
        setIsModalOpen(true);
      }}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50 flex items-center justify-center"
      aria-label="New booking"
    >
      <Plus className="w-8 h-8" />
    </button>

    {/* Floating Tutorial Button - only show for first-time users */}
    {isInitialized && showTutorialButton && (
      <button
        type="button"
        onClick={handleTutorialClick}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-purple-600 text-white shadow-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 z-50 flex items-center justify-center animate-pulse"
        aria-label={tutorialCompleted || tutorialSkipped ? "Restart tutorial" : "Start tutorial"}
        title={tutorialCompleted || tutorialSkipped ? "Restart interactive tutorial" : "Start interactive tutorial"}
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    )}

    <ReservationViewModal
      isOpen={isViewModalOpen}
      onClose={() => {
        setIsViewModalOpen(false);
        setSelectedBooking(null);
      }}
      booking={selectedBooking}
      onEdit={handleEditBooking}
      onNoShow={handleNoShow}
      onDelete={(booking) => {
        if (window.confirm('Are you sure you want to delete this reservation?')) {
          deleteBookingMutation.mutate(booking._id);
          setIsViewModalOpen(false);
        }
      }}
    />

    <BookingModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setSelectedBooking(null);
      }}
      booking={selectedBooking}
      rooms={rooms}
      onSuccess={() => {
        setIsModalOpen(false);
        setSelectedBooking(null);
      }}
    />

    <InstructionsModal
      isOpen={showInstructions}
      onClose={() => setShowInstructions(false)}
    />

    <BookingConfirmation
      isOpen={showConfirmation}
      onClose={handleConfirmationClose}
      booking={selectedBooking}
    />
    
    {/* Analytics Modal - placeholder */}
    {showAnalytics && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics
          </h2>
          <p className="text-gray-600 mb-4">Analytics dashboard coming soon...</p>
          <Button onClick={() => setShowAnalytics(false)} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )}
    
    {/* Customer Base Modal - placeholder */}
    {showCustomerBase && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Customer Base
          </h2>
          <p className="text-gray-600 mb-4">Customer management dashboard coming soon...</p>
          <Button onClick={() => setShowCustomerBase(false)} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )}
    </>
  );
};

export default TraditionalSchedule;
