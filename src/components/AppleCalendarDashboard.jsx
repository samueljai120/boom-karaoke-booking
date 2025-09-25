import React, { useState, useMemo } from 'react';
import moment from 'moment-timezone';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { roomsAPI, bookingsAPI, healthAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  Settings, 
  Menu,
  Plus,
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  Brain,
  Zap,
  HelpCircle
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useBusinessHours } from '../contexts/BusinessHoursContext';
import { useTutorial } from '../contexts/TutorialContext';
import BookingModal from './BookingModal';
import ReservationViewModal from './ReservationViewModal';
import SettingsModal from './SettingsModal';
import InstructionsModal from './InstructionsModal';
import TraditionalSchedule from './TraditionalSchedule';
import LoadingSkeleton from './LoadingSkeleton';
import AIBookingAssistant from './AIBookingAssistant';
import AIAnalyticsDashboard from './AIAnalyticsDashboard';
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

// Enhanced draggable booking component with resize functionality
const DraggableBooking = ({ booking, children, onDoubleClick, style: customStyle, onClick, onResize }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isQuickEdit, setIsQuickEdit] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'top' or 'bottom'
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [wasDragged, setWasDragged] = useState(false);
  const rootRef = React.useRef(null);
  
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
    cursor: 'ns-resize',
  } : {};

  const combinedStyle = { ...customStyle, ...dragStyle, ...hoverStyle, ...resizeStyle };

  // Track end of drag to suppress accidental clicks
  React.useEffect(() => {
    if (isDragging) return;
    if (!isDragging && transform) return; // during settle
    // brief window to ignore click after drag end
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

  // Handle resize drag
  const handleResizeMouseDown = (e, handle) => {
    e.stopPropagation();
    if (!isResizing) {
      setIsResizing(true);
    }
    setResizeHandle(handle);
    const startY = e.clientY;
    const startHeight = customStyle?.height || 96;
    const startTop = customStyle?.top || 0;

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      
      if (handle === 'top') {
        // Resize from top (change start time)
        const newTop = startTop + deltaY;
        const newHeight = startHeight - deltaY;
        if (newHeight > 30) { // Minimum height
          // Call resize callback
          onResize?.(booking._id, { top: newTop, height: newHeight, handle: 'top' });
        }
      } else if (handle === 'bottom') {
        // Resize from bottom (change end time)
        const newHeight = startHeight + deltaY;
        if (newHeight > 30) { // Minimum height
          // Call resize callback
          onResize?.(booking._id, { top: startTop, height: newHeight, handle: 'bottom' });
        }
      }
    };

    const handleMouseUpResize = () => {
      setResizeHandle(null);
      setIsResizing(false);
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

  const handleRootClick = (e) => {
    if (isResizing || isDragging || wasDragged || isQuickEdit) {
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
      className={`absolute rounded-lg shadow-sm border text-white text-xs transition-all duration-200 group ${
        isResizing ? 'cursor-ns-resize ring-2 ring-blue-300' : isQuickEdit ? 'cursor-move ring-2 ring-blue-300 animate-pulse' : 'cursor-grab active:cursor-grabbing'
      } ${isOver && !isResizing ? 'ring-2 ring-orange-300' : ''} ${isDragging ? 'rotate-2 scale-105' : ''}`}
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
            // Allow drag start from body; do not start resize here
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
      {/* Top resize handle - always available */}
      <div
        className="absolute -top-1 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/50 z-10"
        onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
      />

      {/* Bottom resize handle - always available */}
      <div
        className="absolute -bottom-1 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-blue-500/50 z-10"
        onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
      />

      {/* Resize mode indicator */}
      {isResizing && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Resize Mode - ESC to exit
        </div>
      )}

      {/* Swap indicator */}
      {isOver && !isResizing && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          🔄
        </div>
      )}

      {children}
    </div>
  );
};

// Droppable slot component for vertical view with swap indication
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
      className={`${className} ${backgroundClass} transition-colors duration-200`}
      style={style}
      onClick={onClick}
      title={draggedBooking && isOver ? 'Drop to place booking' : ''}
    >
      {children}
    </div>
  );
};

const AppleCalendarDashboard = () => {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState(null);
  const [draggedBooking, setDraggedBooking] = useState(null);
  
  // Component initialization
  
  // Visual debug indicator - will be moved after bookings declaration
  
  // Component initialization
  React.useEffect(() => {
    // Test API call to verify authentication - use direct import instead of dynamic
    const testAPI = async () => {
      try {
        // Import healthAPI directly since it's already imported at the top
        await healthAPI.check();
      } catch (error) {
        // Health check failed - error handling removed for clean version
      }
    };
    
    testAPI();
  }, []);
  
  // Default to today's date on load/refresh
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Mini calendar month base (independent from selected date)
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCustomerBase, setShowCustomerBase] = useState(false);
  const [showAIBooking, setShowAIBooking] = useState(false);
  const [showAIAnalytics, setShowAIAnalytics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // Responsive viewport tracking for adaptive sizing
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [windowHeight, setWindowHeight] = React.useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  React.useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Current time tracking
  const [currentTime, setCurrentTime] = React.useState(new Date());
  React.useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate current time position on schedule
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
    
    // Check if current time is within business hours
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    let isWithinBusinessHours = false;
    if (isLateNight) {
      // Late night: from openHour to closeHour next day
      isWithinBusinessHours = currentHour >= openHour || currentHour < closeHour;
    } else {
      // Normal hours: from openHour to closeHour same day
      isWithinBusinessHours = (currentHour > openHour || (currentHour === openHour && currentMinute >= openMinute)) && 
                              (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute));
    }
    
    if (!isWithinBusinessHours) {
      return null; // Don't show line if outside business hours
    }
    
    // Calculate position in minutes from start of business day
    const dayStart = selectedDateMoment.clone().startOf('day').add(openHour, 'hours').add(openMinute, 'minutes');
    const minutesFromStart = now.diff(dayStart, 'minutes');
    
    return {
      minutesFromStart,
      time: now.format('h:mm A'),
      isVisible: true
    };
  };

  const currentTimeData = getCurrentTimePosition();

  // Calculate which room column the current timeline is in
  const getCurrentTimelineRoomIndex = () => {
    if (!currentTimeData) return null;
    
    // In Apple Calendar layout, the timeline extends horizontally across all rooms
    // We'll highlight all rooms since the timeline affects the entire schedule
    // For future enhancements, this could be calculated based on specific room positions
    return null; // Highlight all rooms when timeline is active
  };

  const currentTimelineRoomIndex = getCurrentTimelineRoomIndex();

  // Compute responsive widths
  const TIME_COL_WIDTH = windowWidth < 640 ? 56 : windowWidth < 1024 ? 64 : 80; // px
  const ROOM_COL_WIDTH = windowWidth < 640 ? 140 : windowWidth < 1024 ? 180 : 200; // px

  // Calculate actual rendered room column width (flex-1 stretches columns)
  const getActualRoomColumnWidth = () => {
    const availableWidth = windowWidth - TIME_COL_WIDTH - (sidebarOpen ? (windowWidth < 640 ? 256 : windowWidth < 1024 ? 288 : 320) : 56);
    const actualWidth = Math.max(ROOM_COL_WIDTH, availableWidth / rooms.length);
    return actualWidth;
  };

  // Calculate responsive slot height based on viewport and settings
  const getResponsiveSlotHeight = () => {
    // Enhanced slot height mapping with more options
    const heightMap = {
      'tiny': 48,
      'small': 72,
      'medium': 96,
      'large': 112,
      'huge': 128
    };
    const baseHeight = heightMap[settings.verticalLayoutSlots?.slotHeight] || 96;
    const minHeight = Math.max(32, baseHeight);
    
    // Calculate available height for time slots (excluding header, room info, and padding)
    const headerHeight = 64; // Top navigation height
    const roomInfoHeight = 64; // Room column header height (h-16 = 64px)
    const padding = 20; // Minimal padding
    const availableHeight = windowHeight - headerHeight - roomInfoHeight - padding;
    const timeSlotsCount = timeSlots.length;
    
    if (timeSlotsCount === 0) {
      // No time slots available, using minimum height
      return minHeight;
    }
    
    // Calculate optimal height based on available space
    const optimalHeight = availableHeight / timeSlotsCount;
    
    // For tiny/small settings, allow more compression
    const compressionThreshold = settings.verticalLayoutSlots?.slotHeight === 'tiny' ? 0.7 : 
                                settings.verticalLayoutSlots?.slotHeight === 'small' ? 0.8 : 0.9;
    
    // Use the larger of: user preference or calculated optimal height (with compression)
    const finalHeight = Math.max(
      minHeight, 
      Math.round(optimalHeight * compressionThreshold)
    );
    
    // Safety check for valid height
    if (isNaN(finalHeight) || finalHeight <= 0) {
      // Invalid slot height calculated, using minimum height
      return minHeight;
    }
    
    return finalHeight;
  };


  const getBookingColorBySource = React.useCallback((booking) => {
    const sourceKey = (booking.source || '').toLowerCase();
    const map = settings.bookingSourceColors || {};
    // Normalize common aliases
    const normalized =
      sourceKey === 'walk_in' || sourceKey === 'walk-in' || sourceKey === 'walkin' ? 'walkin' :
      sourceKey === 'phone' || sourceKey === 'call' ? 'phone' :
      sourceKey === 'email' ? 'email' :
      sourceKey === 'message' || sourceKey === 'msg' || sourceKey === 'sms' ? 'message' :
      sourceKey === 'online' || sourceKey === 'web' ? 'online' : sourceKey;
    return map[normalized] || map.online || '#2563eb';
  }, [settings.bookingSourceColors]);
  const queryClient = useQueryClient();

  // Scroll synchronization refs (time column <-> grid)
  const timeColumnRef = React.useRef(null);
  const gridScrollRef = React.useRef(null);

  const syncTimeFromGrid = React.useCallback(() => {
    try {
      if (!timeColumnRef.current || !gridScrollRef.current) return;
      if (timeColumnRef.current.scrollTop !== gridScrollRef.current.scrollTop) {
        timeColumnRef.current.scrollTop = gridScrollRef.current.scrollTop;
      }
    } catch {}
  }, []);

  const syncGridFromTime = React.useCallback(() => {
    try {
      if (!timeColumnRef.current || !gridScrollRef.current) return;
      if (gridScrollRef.current.scrollTop !== timeColumnRef.current.scrollTop) {
        gridScrollRef.current.scrollTop = timeColumnRef.current.scrollTop;
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

  // Track layout orientation changes
  React.useEffect(() => {
    // Layout orientation changed
  }, [settings.layoutOrientation]);

  // Keep mini calendar in sync when selectedDate changes elsewhere
  React.useEffect(() => {
    setCalendarBaseDate(selectedDate);
  }, [selectedDate]);

  // Component mount/unmount handling
  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Page about to refresh/navigate
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Debug user state before query (removed for production)
  
  // Test API call directly (removed for production)
  
  // Fetch rooms with optimized settings
  const { data: roomsData, isLoading: roomsLoading, error: roomsError, isSuccess: roomsSuccess } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const result = await roomsAPI.getAll();
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Temporarily always enabled for debugging
  });

  // Fetch all bookings with optimized settings
  const { data: bookingsData, isFetching: bookingsFetching, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => {
      return bookingsAPI.getAll();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes to avoid jitter during interactions
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      // Bookings query successful
    },
  });

  const rooms = roomsData?.data || [];
  const bookings = bookingsData?.data?.bookings || [];
  
  // Bookings data loaded
  
  // Visual debug indicator removed for production

  // Track bookings data changes for debugging (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Bookings data updated
    }
  }, [bookings]);
  
  // Debug logging (removed for production)
  
  // Simplified booking processing - no test booking needed

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
        const { bookingId, newRoomId, newTimeIn, newTimeOut, targetBookingId, targetNewTimeIn, targetNewTimeOut } = variables || {};

        // Find current records
        const sourceIdx = oldBookings.findIndex(b => b._id === bookingId);
        const targetIdx = targetBookingId ? oldBookings.findIndex(b => b._id === targetBookingId) : -1;
        
        if (sourceIdx === -1) {
          // Source booking not found
          return { previous };
        }

        const source = oldBookings[sourceIdx];
        const target = targetIdx !== -1 ? oldBookings[targetIdx] : null;
        const newRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === newRoomId || r.id === newRoomId) : null) || source.room || source.roomId;

        let updated = [...oldBookings];

        if (target && targetBookingId) {
          // Swap: move source into target's slot, target into source's slot
          // Source goes to target's room, target goes to source's room
          const sourceRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === targetRoomId || r.id === targetRoomId) : null) || source.room || source.roomId;
          const targetRoom = (rooms && Array.isArray(rooms) ? rooms.find(r => r._id === newRoomId || r.id === newRoomId) : null) || target.room || target.roomId;
          
          // Room lookup for swap
          
          const sourceNew = {
            ...source,
            room: newRoom, // Source goes to the dropped room (target's room)
            roomId: newRoomId, // Use primitive ID for roomId
            timeIn: newTimeIn,
            timeOut: newTimeOut,
            startTime: newTimeIn,
            endTime: newTimeOut,
          };
          
          const targetNew = {
            ...target,
            room: sourceRoom, // Target goes to source's original room
            roomId: targetRoomId, // Use primitive ID for roomId
            timeIn: targetNewTimeIn,
            timeOut: targetNewTimeOut,
            startTime: targetNewTimeIn,
            endTime: targetNewTimeOut,
          };
          
          // Swap optimistic update
          
          updated[sourceIdx] = sourceNew;
          updated[targetIdx] = targetNew;
          
          // Swap update completed
        } else {
        // Simple move
        updated[sourceIdx] = {
          ...source,
          room: newRoom,
          roomId: newRoomId, // Use primitive ID for roomId
          timeIn: newTimeIn,
          timeOut: newTimeOut,
          startTime: newTimeIn,
          endTime: newTimeOut,
        };
        
        // Move update completed
        }

        // Apply optimistic update to React Query cache
        queryClient.setQueryData(['bookings'], (old) => {
          const newData = {
            ...(old || {}),
            data: {
              ...((old || {}).data || {}),
              bookings: updated,
            },
          };
          
          return newData;
        });
        
        // Optimistic update completed
      } catch (e) {
        // Optimistic move update failed - silently continue
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
      if (variables?.targetBookingId) {
        toast.success(`🔄 Bookings swapped: ${data?.data?.source?.customerName} ↔ ${data?.data?.target?.customerName}`);
      } else {
        toast.success('📍 Booking moved successfully');
      }
      
      // Invalidate queries to ensure data consistency
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Mutation for resizing bookings with optimistic update
  const resizeBookingMutation = useMutation({
    mutationFn: bookingsAPI.resize,
    onMutate: async (variables) => {
      // // console.log (removed for clean version)('🔄 Resize mutation onMutate called with variables:', variables);
      await queryClient.cancelQueries({ queryKey: ['bookings'] });
      const previous = queryClient.getQueryData(['bookings']);
      try {
        const oldBookings = previous?.data?.bookings || [];
        const { bookingId, newStartTime, newEndTime } = variables || {};
        const idx = oldBookings.findIndex(b => b._id === bookingId);
        if (idx === -1) {
          // console.warn('❌ Booking not found for resize:', bookingId);
          return { previous };
        }
        const updated = [...oldBookings];
        const current = updated[idx];
        // // console.log (removed for clean version)('🔄 Updating booking from:', {
        //   startTime: current.startTime,
        //   endTime: current.endTime
        // }, 'to:', {
        //   startTime: newStartTime,
        //   endTime: newEndTime
        // });
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
        // // console.log (removed for clean version)('✅ Optimistic resize update applied');
      } catch (e) {
        // Optimistic resize update failed - silently continue
      }
      return { previous };
    },
    onError: (err, vars, context) => {
      // console.error('❌ Resize mutation failed:', err);
      if (context?.previous) {
        queryClient.setQueryData(['bookings'], context.previous);
      }
      try {
        const message = err?.response?.data?.message || err?.response?.data?.error || 'Failed to resize booking';
        toast.error(message);
      } catch {}
    },
    onSuccess: (data, variables) => {
      // // console.log (removed for clean version)('✅ Resize mutation succeeded:', { data, variables });
      toast.success('Booking resized');
    },
    onSettled: () => {},
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
    // Safety check: ensure bookings is always an array
    if (!bookings || !Array.isArray(bookings)) {
      return [];
    }
    
    const mapped = bookings.map(b => ({
      ...b,
      roomId: b.roomId || (b.room && typeof b.room === 'object' ? b.room._id : b.room),
      room: b.room || b.roomId,
      startTime: b.startTime || b.timeIn,
      endTime: b.endTime || b.timeOut,
      timeIn: b.timeIn || b.startTime,
      timeOut: b.timeOut || b.endTime,
    }));

    // Filter bookings that overlap with the selected date
    const selectedStart = moment(selectedDate).startOf('day');
    const selectedEnd = moment(selectedDate).endOf('day');
    
    const filtered = mapped.filter(b => {
      // Safety check for booking object
      if (!b || typeof b !== 'object') {
        return false;
      }
      
      const bookingStart = moment(b.startTime || b.timeIn);
      const bookingEnd = moment(b.endTime || b.timeOut);
      
      // Check if booking overlaps with selected date
      const overlaps = bookingStart.isBefore(selectedEnd) && bookingEnd.isAfter(selectedStart);
      return overlaps;
    });
    
    return filtered;
  }, [bookings, selectedDate]);
  // Only show full-screen skeleton on first paint (no rooms loaded yet)
  const initialRoomsLoaded = !!roomsData?.data;
  const isLoading = roomsLoading && !initialRoomsLoaded;
  const hasError = roomsError || bookingsError;
  
  // Debug loading state (removed for production)

  // Removed debug logging - working correctly now

  // Get room type color
  const getRoomTypeColor = (type) => {
    const colors = {
      medium: '#3B82F6',
      large: '#10B981',
      party: '#F59E0B',
    };
    return colors[type] || '#3B82F6';
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(calendarBaseDate).startOf('month');
    const endOfMonth = moment(calendarBaseDate).endOf('month');
    const startOfCalendar = startOfMonth.clone().startOf('week');
    const endOfCalendar = endOfMonth.clone().endOf('week');
    
    const days = [];
    const current = startOfCalendar.clone();
    
    while (current.isSameOrBefore(endOfCalendar, 'day')) {
      days.push({
        date: current.clone(),
        isCurrentMonth: current.isSame(calendarBaseDate, 'month'),
        isToday: current.isSame(moment(), 'day'),
        isSelected: current.isSame(selectedDate, 'day'),
      });
      current.add(1, 'day');
    }
    
    return days;
  }, [calendarBaseDate, selectedDate]);

  // Generate time slots using business hours from API
  const timeSlots = useMemo(() => {
    const timezone = settings.timezone || 'America/New_York';
    const slots = [];
    
    // Get business hours for the selected date
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
      // Debug logging removed for clean version
      // console.log('🍎 AppleCalendarDashboard: Generating time slots for weekday', weekday, 'with business hours:', dayHours);
    
    if (dayHours.isClosed) {
      return [];
    }
    
    // Parse open and close times
    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    // Check if this is late night hours (close time is next day)
    const isLateNight = closeHour < openHour || (closeHour === openHour && closeMinute < openMinute);
    
    // Generate time slots using configurable interval within business hours
    const timeInterval = settings.timeInterval || 15; // Default to 15 minutes if not set
    let currentMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    const maxSlots = 48 * 60; // Allow up to 48 hours for late night businesses (in minutes)
    
    while (currentMinutes < maxSlots) {
      // Calculate the actual hour and minute for display
      const displayHour = Math.floor(currentMinutes / 60) % 24;
      const displayMinute = currentMinutes % 60;
      const timeString = `${displayHour.toString().padStart(2, '0')}:${displayMinute.toString().padStart(2, '0')}`;
      
      // For late night hours, check if we've reached the close time
      if (isLateNight) {
        // If we've passed midnight and reached close time, stop
        if (currentMinutes >= 24 * 60 && displayHour > closeHour) {
          break;
        }
        // If we're still before midnight and haven't reached close time, continue
        if (currentMinutes < 24 * 60 && displayHour < closeHour) {
          // Continue
        } else if (currentMinutes >= 24 * 60) {
          // We've passed midnight, check if we've reached the close time
          if (displayHour > closeHour) {
            break;
          }
        }
      } else {
        // Normal hours - stop when we reach close time
        if (displayHour > closeHour || (displayHour === closeHour && displayMinute >= closeMinute)) {
          break;
        }
      }
      
      slots.push({
        time: moment().tz(timezone).hour(displayHour).minute(displayMinute).format('h:mm A'),
        hour: Math.floor(currentMinutes / 60),
        displayHour: displayHour,
        minute: displayMinute,
        minutes: currentMinutes,
        timeString,
        isNextDay: currentMinutes >= 24 * 60
      });
      
      currentMinutes += timeInterval; // Generate slots using configurable interval
    }
    
    return slots;
  }, [getBusinessHoursForDay, settings.timezone, settings.timeInterval, selectedDate, businessHours]);


  // Calculate slot height once and use consistently
  const SLOT_HEIGHT = useMemo(() => {
    return getResponsiveSlotHeight();
  }, [settings.verticalLayoutSlots, windowHeight, timeSlots]);

  // Group bookings by room and calculate positions
  const bookingsByRoom = useMemo(() => {
    const grouped = {};
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    
    // Safety check for business hours
    if (!dayHours || !dayHours.openTime) {
      return {};
    }
    
    const [openHour] = dayHours.openTime.split(':').map(Number);
    
    // Safety check for open hour
    if (isNaN(openHour)) {
      return {};
    }
    
    // Safety check: ensure normalizedBookings is always an array
    if (!normalizedBookings || !Array.isArray(normalizedBookings)) {
      return {};
    }
    
    // Processing bookings by room
    
    rooms.forEach(room => {
      const roomBookings = normalizedBookings.filter(booking => {
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
        
        const roomMatch = bookingRoomId == (room._id || room.id); // Use loose equality for type flexibility
        const statusMatch = booking.status !== 'cancelled' && booking.status !== 'no_show';
        
        // Room matching logic
        
        return roomMatch && statusMatch;
      });
      
      // Room bookings processed
      
      grouped[room._id || room.id] = roomBookings
        .map(booking => {
          const timezone = settings.timezone || 'America/New_York';
          
          // Validate booking has required time data
          if (!booking.startTime && !booking.timeIn) {
            // Booking missing start time
            return null;
          }
          if (!booking.endTime && !booking.timeOut) {
            // Booking missing end time
            return null;
          }
          
          const start = moment(booking.startTime || booking.timeIn).tz(timezone);
          const end = moment(booking.endTime || booking.timeOut).tz(timezone);
          
          // Validate moment parsing
          if (!start.isValid()) {
            // Invalid start time
            return null;
          }
          if (!end.isValid()) {
            // Invalid end time
            return null;
          }
          
          const dayStart = moment(selectedDate).startOf('day').add(openHour, 'hours').tz(timezone);
          
          // Calculate position in minutes from open time
          const startMinutes = start.diff(dayStart, 'minutes');
          const endMinutes = end.diff(dayStart, 'minutes');
          const durationMinutes = endMinutes - startMinutes;
          
          // Convert to pixel positions
          // Don't clamp bookings - show them even if outside business hours
          const clampedStartMinutes = startMinutes;
          const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
          const clampedEndMinutes = endMinutes;
          const clampedDuration = clampedEndMinutes - clampedStartMinutes;
          
          // Only filter out if duration is negative (invalid booking)
          if (clampedDuration <= 0) {
            // Invalid booking duration
            
            // For debugging: try to fix the booking by adding 1 hour to end time
            if (clampedDuration === 0 && booking.startTime && booking.endTime) {
              // Attempting to fix booking with 0 duration
              // This is just for debugging - we don't actually modify the booking here
              // The real fix should be in the form validation
            }
            
            return null;
          }
          
          // Calculate exact positioning based on actual time, using precise pixel calculations
          const timeInterval = settings.timeInterval || 15; // Use configurable time interval
          
          // Calculate precise pixel positions based on actual time, not slot boundaries
          const topPixels = (clampedStartMinutes / timeInterval) * SLOT_HEIGHT;
          const heightPixels = (clampedDuration / timeInterval) * SLOT_HEIGHT;
          
          // For debugging, also calculate the slot-based approach
          const debugStartSlotIndex = Math.round(clampedStartMinutes / timeInterval);
          const debugDurationSlots = Math.round(clampedDuration / timeInterval);
          
          // Positioning calculation
          
          // Force minimum dimensions to ensure visibility, but only for very small durations
          const minHeight = 1; // Minimum 1px height
          const finalHeightPixels = Math.max(heightPixels, minHeight);
          
          // Safety check for valid dimensions
          if (isNaN(topPixels) || isNaN(finalHeightPixels) || finalHeightPixels <= 0) {
            return null;
          }

          const result = {
            ...booking,
            startMinutes,
            endMinutes,
            durationMinutes,
            topPixels,
            heightPixels: finalHeightPixels,
          };
          
          // Positioning calculated
          
          return result;
        })
        .filter(Boolean);
    });
    
    return grouped;
  }, [rooms, normalizedBookings, selectedDate, getBusinessHoursForDay, businessHours, SLOT_HEIGHT, timeSlots, getActualRoomColumnWidth, windowWidth, sidebarOpen]);

  // Handle date navigation
  const navigateDate = (direction) => {
    const newDate = moment(selectedDate).add(direction, 'day');
    setSelectedDate(newDate.toDate());
  };

  // Handle mini calendar month navigation only
  const navigateMonth = (direction) => {
    const next = moment(calendarBaseDate).add(direction, 'month').toDate();
    setCalendarBaseDate(next);
  };

  // Handle calendar day click
  const handleDayClick = (day) => {
    const picked = day.date.toDate();
    setSelectedDate(picked);
    setCalendarBaseDate(picked);
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
        roomId: booking.roomId._id,
        roomName: booking.roomId.name,
        roomType: booking.roomId.type,
        capacity: booking.roomId.capacity,
        color: booking.roomId.color,
        phone: booking.phone,
        source: booking.source,
        notes: booking.notes,
        duration: booking.durationMinutes,
      },
    });
    setIsViewModalOpen(false);
    setIsModalOpen(true);
  };

  // Helper function to find booking conflicts
  const findBookingConflicts = (roomId, startTime, endTime, excludeBookingId = null) => {
    if (!normalizedBookings || !Array.isArray(normalizedBookings)) {
      return [];
    }
    
    const conflicts = normalizedBookings.filter(b => {
      if (b._id === excludeBookingId) {
        return false;
      }
      
      // Improved room matching logic
      let bookingRoomId;
      if (typeof b.roomId === 'object' && b.roomId !== null) {
        bookingRoomId = b.roomId._id || b.roomId.id;
      } else if (typeof b.room === 'object' && b.room !== null) {
        bookingRoomId = b.room._id || b.room.id;
      } else {
        bookingRoomId = b.roomId || b.room;
      }
      
      const roomMatch = bookingRoomId == roomId; // Use loose equality for type flexibility
      
      if (!roomMatch) {
        return false;
      }
      
      const bStart = moment(b.startTime || b.timeIn);
      const bEnd = moment(b.endTime || b.timeOut);
      const newStart = moment(startTime);
      const newEnd = moment(endTime);
      
      // Check for overlap
      const overlaps = newStart.isBefore(bEnd) && newEnd.isAfter(bStart);
      
      return overlaps;
    });
    
    return conflicts;
  };

  // Drag and drop handlers
  const handleDragStart = (event) => {
    const { active } = event;
    if (!normalizedBookings || !Array.isArray(normalizedBookings)) {
      return;
    }
    const booking = normalizedBookings.find(b => b._id === active.id);
    setActiveId(active.id);
    setDraggedBooking(booking);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedBooking(null);

    if (!over) {
      return;
    }

    const overId = String(over.id);
    
    if (!normalizedBookings || !Array.isArray(normalizedBookings)) {
      return;
    }
    const booking = normalizedBookings.find(b => b._id === active.id);
    
    if (!booking) {
      return;
    }

    if (overId.startsWith('slot-')) {
      const rest = overId.slice('slot-'.length);
      const lastDash = rest.lastIndexOf('-');
      if (lastDash === -1) {
        return;
      }
      const roomId = parseInt(rest.slice(0, lastDash));
      const timeSlotIndex = rest.slice(lastDash + 1);
      
      // Calculate new time slot for vertical view
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
      const slotHour = targetSlot.hour;
      const slotMinute = targetSlot.minute;
      
      const dayStart = moment(selectedDate).startOf('day');
      const newTimeIn = dayStart.clone().add(slotHour, 'hours').add(slotMinute, 'minutes').toISOString();
      const duration = moment(booking.timeOut || booking.endTime).diff(moment(booking.timeIn || booking.startTime), 'minutes', true);
      const newTimeOut = dayStart.clone().add(slotHour, 'hours').add(slotMinute, 'minutes').add(duration, 'minutes').toISOString();

      // Check if dropping on different room or time
      const currentRoomId = booking.room?._id || booking.roomId?._id || booking.roomId;
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
        } else if (conflicts.length === 0) {
          // No conflicts - simple move
          moveBookingMutation.mutate({
            bookingId: booking._id,
            newRoomId: roomId,
            newTimeIn,
            newTimeOut,
          });
        } else {
          // Multiple conflicts - show error
          toast.error('Cannot place booking here: Multiple conflicting reservations detected.');
        }
      }
    } else if (overId.startsWith('booking-')) {
      // Handle direct booking-to-booking swap
      const targetId = overId.slice('booking-'.length);
      const targetBooking = normalizedBookings?.find(b => b._id === targetId);
      if (targetBooking && targetBooking._id !== booking._id) {
        const targetRoomId = targetBooking.room?._id || targetBooking.roomId?._id || targetBooking.roomId;
        moveBookingMutation.mutate({
          bookingId: booking._id,
          newRoomId: targetRoomId,
          newTimeIn: targetBooking.timeIn || targetBooking.startTime,
          newTimeOut: targetBooking.timeOut || targetBooking.endTime,
          targetBookingId: targetBooking._id,
        });
      }
    }
  };

  // Handle booking resize
  const handleBookingResize = (bookingId, resizeData) => {
    const { top, height, handle } = resizeData;
    if (!normalizedBookings || !Array.isArray(normalizedBookings)) {
      return;
    }
    const booking = normalizedBookings.find(b => b._id === bookingId);
    if (!booking) return;

    // Convert pixels to time (use consistent slot height)
    const weekday = selectedDate.getDay();
    const dayHours = getBusinessHoursForDay(weekday);
    const [openHour] = dayHours.openTime.split(':').map(Number);
    const dayStart = moment(selectedDate).startOf('day').add(openHour, 'hours');
    
    // Get the current time interval setting
    const timeInterval = settings.timeInterval || 15;
    
    // Debug logging removed for clean version
    //   timeInterval,
    //   settingsTimeInterval: settings.timeInterval,
    //   is60Minute: timeInterval === 60,
    //   top,
    //   height,
    //   SLOT_HEIGHT
    // });
    
    // Calculate new times based on visual slot proportions
    // Each slot represents the timeInterval, so we need to calculate based on slot fractions
    const topSlots = top / SLOT_HEIGHT;
    const heightSlots = height / SLOT_HEIGHT;
    
    // Convert slot fractions to actual time changes
    const topMinutes = topSlots * timeInterval;
    const heightMinutes = heightSlots * timeInterval;
    
    // For 60-minute intervals, allow 30-minute granularity (half-slot precision)
    // For other intervals, use the interval itself
    const resizeSnapInterval = timeInterval === 60 ? 30 : timeInterval;
    
    // Snap to resize interval
    const snappedTopMinutes = Math.round(topMinutes / resizeSnapInterval) * resizeSnapInterval;
    const snappedHeightMinutes = Math.round(heightMinutes / resizeSnapInterval) * resizeSnapInterval;
    
    let newStartTime, newEndTime;
    
    if (handle === 'top') {
      // Changing start time (top edge)
      newStartTime = dayStart.clone().add(snappedTopMinutes, 'minutes').toISOString();
      newEndTime = booking.endTime; // Keep end time same
    } else {
      // Changing end time (bottom edge)
      newStartTime = booking.startTime; // Keep start time same
      newEndTime = dayStart.clone().add(snappedTopMinutes + snappedHeightMinutes, 'minutes').toISOString();
    }

    // Call resize API
    // // console.log (removed for clean version)('🚀 Calling resize API with:', {
    //   bookingId,
    //   newStartTime,
    //   newEndTime,
    //   originalStartTime: booking.startTime,
    //   originalEndTime: booking.endTime,
    //   timeInterval,
    //   resizeSnapInterval
    // });
    
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

  // Render both layouts but show only the active one
  return (
    <>
      {/* Debug Indicator removed for production */}
      
      {/* Vertical Layout */}
      {settings.layoutOrientation === 'rooms-y-time-x' && (
        <TraditionalSchedule
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onSettingsClick={() => setShowSettings(true)}
        />
      )}
      
      {/* Horizontal Layout */}
      {settings.layoutOrientation === 'rooms-x-time-y' && (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'w-64 md:w-72 lg:w-80' : 'w-14'} bg-white border-r border-gray-200 flex flex-col sticky top-0 self-start h-screen`}>
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
                setSelectedDate(new Date());
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
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors [&>svg]:w-8 [&>svg]:h-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth(-1);
                }}
              >
                <ChevronLeft className="w-8 h-8 strokeWidth={2.5}" />
              </button>
              <div className="min-w-[140px] text-center text-lg font-semibold text-gray-900 select-none">
                {moment(calendarBaseDate).format('MMMM YYYY')}
              </div>
              <button
                type="button"
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors [&>svg]:w-8 [&>svg]:h-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigateMonth(1);
                }}
              >
                <ChevronRight className="w-8 h-8 strokeWidth={2.5}" />
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
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDayClick(day);
                  }}
                  className={`
                    w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${day.isToday ? 'bg-blue-100 text-blue-600' : ''}
                    ${day.isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
                  `}
                >
                  {day.date.format('D')}
                </button>
              ))}
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

        {/* Bottom Sticky Actions: AI Features + Analytics + Customer Base + Instructions + Settings */}
        <div className="mt-auto border-t border-gray-200 p-2 space-y-2">
          {sidebarOpen ? (
            <>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => setShowAIBooking(true)}
              >
                <Brain className="w-4 h-4 mr-3" />
                AI Assistant
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setShowAIAnalytics(true)}
              >
                <Zap className="w-4 h-4 mr-3" />
                AI Analytics
              </Button>
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
                onClick={() => setShowSettings(true)}
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
                className="h-12 w-12 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => setShowAIBooking(true)}
                title="AI Assistant"
              >
                <Brain className="w-6 h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => setShowAIAnalytics(true)}
                title="AI Analytics"
              >
                <Zap className="w-6 h-6" />
              </Button>
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
                onClick={() => setShowSettings(true)}
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
          <div className="flex items-center justify-between">
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
            {/* Removed top-right new booking button (replaced by floating action button) */}
          </div>
        </div>

        {/* Schedule Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={(e) => {
            // Cancel any long-press timers to avoid resize-mode delay feeling
            try {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('cancel-long-press'));
              }
            } catch {}
            handleDragStart(e);
          }}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 relative max-h-[calc(100vh-200px)] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Sticky Header Row */}
              <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 z-20">
                <div className="h-16 border-r border-gray-200 bg-gray-50" style={{ width: TIME_COL_WIDTH }}></div>
                {rooms.map((room, roomIndex) => {
                  return (
                    <div
                      key={room._id || room.id}
                      className="flex-1 h-16 border-r border-gray-200 px-3 md:px-4 flex items-center last:border-r-0"
                      style={{ minWidth: `${ROOM_COL_WIDTH}px` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: settings.colorByBookingSource ? '#9ca3af' : (room.color || getRoomTypeColor(room.category)) }}
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{room.name || 'Unnamed Room'}</h3>
                          <p className="text-sm text-gray-500">
                            {room.category?.charAt(0).toUpperCase() + room.category?.slice(1)} ({room.capacity} max)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Scrollable Content Area */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sticky Time Column */}
                <div ref={timeColumnRef} onScroll={syncGridFromTime} className="bg-gray-50 border-r border-gray-200 flex-shrink-0 overflow-y-auto" style={{ width: TIME_COL_WIDTH }}>
                  {timeSlots.map((slot, slotIndex) => {
                    // Check if this is the current time slot - synchronized with red line
                    const isCurrentTimeSlot = currentTimeData && (() => {
                      const timeInterval = settings.timeInterval || 15;
                      // Use exact same calculation as red line positioning
                      const currentSlotIndex = Math.round(currentTimeData.minutesFromStart / timeInterval);
                      return slotIndex === currentSlotIndex;
                    })();
                    
                    return (
                      <div 
                        key={slotIndex}
                        className={`border-b border-gray-200 text-right pr-1 md:pr-2 pt-1 flex items-start justify-end ${
                          slot.isNextDay ? 'bg-gray-50/30' : ''
                        } ${
                          isCurrentTimeSlot ? 'bg-red-100 border-red-300' : ''
                        }`}
                        style={{ height: `${SLOT_HEIGHT}px` }}
                      >
                        <span className={`text-xs font-medium ${
                          isCurrentTimeSlot 
                            ? 'text-red-700 font-bold' 
                            : 'text-gray-500'
                        }`}>
                          {isCurrentTimeSlot ? '● ' : ''}{slot.time}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Scrollable Slots */}
                <div ref={gridScrollRef} onScroll={syncTimeFromGrid} className="flex-1 overflow-auto">
                  <div className="flex" style={{ minWidth: `${rooms.length * ROOM_COL_WIDTH}px` }}>
                    {rooms.map((room, roomIndex) => (
                      <div key={room._id || room.id} className="flex-1 border-r border-gray-200 last:border-r-0" style={{ minWidth: `${ROOM_COL_WIDTH}px` }}>
                        {timeSlots.map((slot, slotIndex) => (
                          <div
                            key={slotIndex}
                            className={`relative ${slot.isNextDay ? 'bg-gray-50/30' : ''}`}
                            style={{ height: `${SLOT_HEIGHT}px` }}
                          >
                            <DroppableSlot
                              id={`slot-${room._id || room.id}-${slotIndex}`}
                              className="w-full h-full hover:bg-blue-50 cursor-pointer"
                              onClick={() => handleRoomSlotClick(room, slot)}
                              bookings={normalizedBookings}
                              draggedBooking={draggedBooking}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            

            {/* Current time indicator - positioned outside bookings layer for proper overflow */}
            {currentTimeData && (() => {
              const timeInterval = settings.timeInterval || 15; // Use configurable time interval
              const slotIndex = Math.round(currentTimeData.minutesFromStart / timeInterval);
              const topPixels = slotIndex * SLOT_HEIGHT;
              // Position label so 50% extends above the timeline header
              const labelTop = 64 + topPixels - 24; // 64px is the header height, -12px for 50% overflow
              return (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{ top: `${labelTop}px`, left: `${TIME_COL_WIDTH}px`, right: '0' }}
                >
                  {/* Enhanced time label with better visibility */}
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm px-3 py-2 rounded-r-lg shadow-xl font-bold inline-block border-2 border-white animate-pulse">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      <span>NOW: {currentTimeData.time}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bookings layer - absolutely positioned over the scrollable area */}
            <div className="absolute" style={{ top: '64px', left: `${TIME_COL_WIDTH}px`, right: '0', bottom: '0', pointerEvents: 'none' }}>
              {/* Current time line - extends horizontally through the schedule */}
              {currentTimeData && (() => {
                const timeInterval = settings.timeInterval || 15; // Use configurable time interval
                const slotIndex = Math.round(currentTimeData.minutesFromStart / timeInterval);
                const topPixels = slotIndex * SLOT_HEIGHT;
                return (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${topPixels}px` }}
                  >
                    {/* Enhanced red line with glow effect */}
                    <div className="relative">
                      {/* Main line */}
                      <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg"></div>
                      {/* Glow effect */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-400 opacity-50 blur-sm"></div>
                      {/* Animated pulse line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-300 opacity-30 animate-pulse"></div>
                    </div>
                  </div>
                );
              })()}

              {rooms.map((room, roomIndex) => {
                const roomBookings = bookingsByRoom[room._id || room.id] || [];

                return roomBookings.map((booking) => {
                  // Calculate proper positioning to align with grid slots
                  const roomColumnWidth = getActualRoomColumnWidth();
                  const leftOffset = roomIndex * roomColumnWidth;
                  
                  const style = {
                    position: 'absolute',
                    left: `${leftOffset + 2}px`,
                    width: `${roomColumnWidth - 4}px`,
                    top: `${booking.topPixels}px`,
                    height: `${booking.heightPixels}px`,
                    backgroundColor: settings.colorByBookingSource ? getBookingColorBySource(booking) : (room.color || getRoomTypeColor(room.category)),
                    zIndex: 10,
                    pointerEvents: 'auto',
                  };
                  
                  // Check for invisible booking issues
                  if (booking.heightPixels <= 0 || booking.topPixels < 0) {
                    return null; // Skip invalid bookings
                  }
                  
                  return (
                    <DraggableBooking
                      key={`${room._id || room.id}-${booking._id || booking.id}`}
                      booking={booking}
                      onDoubleClick={handleBookingDoubleClick}
                      onResize={handleBookingResize}
                      style={style}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookingClick(booking);
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
            const [openHour] = dayHours.openTime.split(':').map(Number);
            const start = moment(selectedDate).startOf('hour');
            const end = start.clone().add(1, 'hour');
            setSelectedBooking({
              start: start.toDate(),
              end: end.toDate(),
              resource: { roomId: rooms?.[0]?._id }
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

        {/* Reservation View Modal */}
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

        {/* Booking Modal */}
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
      </div>
    </div>
      )}
      
      {/* Settings Modal - shared between layouts */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
      
      {/* AI Booking Assistant Modal */}
      {showAIBooking && (
        <AIBookingAssistant
          onBookingCreated={() => {
            setShowAIBooking(false);
            queryClient.invalidateQueries(['bookings']);
            toast.success('Booking created with AI assistance!');
          }}
          onClose={() => setShowAIBooking(false)}
        />
      )}

      {/* AI Analytics Modal */}
      {showAIAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-blue-500" />
                  AI Analytics Dashboard
                </h2>
                <button
                  onClick={() => setShowAIAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <AIAnalyticsDashboard />
            </div>
          </div>
        </div>
      )}

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

export default AppleCalendarDashboard;