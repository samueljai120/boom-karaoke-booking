import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { X, HelpCircle, Calendar, Users, Clock, Settings, MousePointer, Hand, Smartphone, Monitor } from 'lucide-react';
import TutorialButton from './TutorialButton';

const InstructionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Card 
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Exit Button - Top Right Corner */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-12 w-12 z-10 bg-white hover:bg-gray-100 border border-gray-200 shadow-lg"
        >
          <X className="h-8 w-8 font-bold text-gray-700" />
        </Button>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>How to use Boom Karaoke</span>
            </CardTitle>
            <TutorialButton variant="default" size="sm" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interactive Tutorial */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Interactive Tutorial
            </h3>
            
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-4 mb-3">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Step-by-Step Guide</span>
              </div>
              <p className="text-sm text-purple-700 mb-3">
                Take our interactive tutorial to learn all the features quickly and efficiently.
              </p>
              <div className="flex items-center space-x-2">
                <TutorialButton variant="default" size="sm" />
                <span className="text-xs text-purple-600">
                  Skip anytime • Restart from here
                </span>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Getting Started
            </h3>
            
            {/* Visual Layout Comparison */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-4 mb-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Two Layout Orientations</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">Horizontal Layout</span>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-green-100 to-green-200 rounded flex items-center justify-center">
                    <div className="text-xs text-green-700 text-center">
                      <div>Time Slots →</div>
                      <div>Rooms ↓</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-gray-700">Vertical Layout</span>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded flex items-center justify-center">
                    <div className="text-xs text-purple-700 text-center">
                      <div>Rooms →</div>
                      <div>Time Slots ↓</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Demo Mode:</strong> This app runs in demo mode with pre-loaded sample data. No login required!</li>
              <li><strong>Two Layouts:</strong> Switch between Horizontal (Time × Rooms) and Vertical (Rooms × Time) layouts</li>
              <li><strong>Real-time Clock:</strong> Digital clock shows current time and updates automatically</li>
              <li><strong>Synchronized Indicators:</strong> Red time line and slot highlighting are perfectly aligned</li>
              <li><strong>Consistent Interface:</strong> All form fields use standardized sentence case labels</li>
              <li><strong>Responsive Design:</strong> Works on desktop, tablet, and mobile devices</li>
            </ul>
          </section>

          {/* Navigation & Calendar */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Navigation & Calendar
            </h3>
            
            {/* Navigation Visual Guide */}
            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-4 mb-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Navigation Controls</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-xs font-medium text-gray-700 mb-1">Date Arrows</div>
                  <div className="flex justify-center space-x-1">
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">←</span>
                    </div>
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-xs font-medium text-gray-700 mb-1">Today Button</div>
                  <div className="w-16 h-6 bg-blue-500 rounded mx-auto flex items-center justify-center">
                    <span className="text-xs text-white">Today</span>
                  </div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-xs font-medium text-gray-700 mb-1">Menu Toggle</div>
                  <div className="w-6 h-6 bg-gray-600 rounded mx-auto flex items-center justify-center">
                    <span className="text-xs text-white">☰</span>
                  </div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-xs font-medium text-gray-700 mb-1">Time Line</div>
                  <div className="w-16 h-1 bg-red-500 rounded mx-auto"></div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Date Navigation:</strong> Use arrow buttons or click days in the mini calendar to jump to specific dates</li>
              <li><strong>Today Button:</strong> Quickly return to today's date using the "Today" button in the mini calendar</li>
              <li><strong>Sidebar Toggle:</strong> Click the menu button to expand/collapse the left sidebar for more screen space</li>
              <li><strong>Current Time Indicator:</strong> Red line shows current time on the schedule grid with synchronized slot highlighting</li>
              <li><strong>Real-time Updates:</strong> Time indicators update every minute and stay perfectly aligned</li>
            </ul>
          </section>

          {/* Creating & Managing Bookings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Creating & Managing Bookings
            </h3>
            
            {/* Booking Interaction Visual Guide */}
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-4 mb-3">
                <MousePointer className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Booking Interactions</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs font-medium text-gray-700 mb-2">Create Booking</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-8 bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Empty Slot</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                    <div className="w-20 h-8 bg-blue-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">Click</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                    <div className="w-20 h-8 bg-green-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">New Booking</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs font-medium text-gray-700 mb-2">Drag & Drop</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-8 bg-orange-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">Drag</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                    <div className="w-16 h-8 bg-gray-200 rounded border-2 border-dashed border-orange-400 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Drop Zone</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                    <div className="w-16 h-8 bg-orange-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">Moved</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs font-medium text-gray-700 mb-2">Resize Booking</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-8 bg-blue-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">1hr</span>
                    </div>
                    <span className="text-xs text-gray-500">→</span>
                    <Hand className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">Long Press</span>
                    <span className="text-xs text-gray-500">→</span>
                    <div className="w-20 h-8 bg-blue-500 rounded text-white flex items-center justify-center">
                      <span className="text-xs">2hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Create Booking:</strong> Click any empty time slot or use the floating + button for quick 1-hour bookings</li>
              <li><strong>Drag & Drop:</strong> Drag bookings to different times/rooms. Drop onto another booking to swap positions</li>
              <li><strong>Resize Bookings:</strong> Long-press a booking, then drag edges to resize duration</li>
              <li><strong>View Details:</strong> Click any booking to view full details, edit, mark no-show, or delete</li>
              <li><strong>Standardized Form Fields:</strong> All fields use consistent sentence case labels (e.g., "Customer name", "Phone number", "Start time")</li>
              <li><strong>Enhanced Validation:</strong> Improved form validation with clear error messages and field requirements</li>
              <li><strong>Status Management:</strong> Set booking status (confirmed, cancelled, no-show) and priority levels</li>
            </ul>
          </section>

          {/* Pricing & Payment */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Pricing & Payment
            </h3>
            
            {/* Pricing Calculation Visual */}
            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm font-medium text-orange-800">💰 Pricing Breakdown</span>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Base Price (2hrs × $25/hr)</span>
                    <span className="font-medium">$50.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Additional Fees</span>
                    <span className="font-medium">+$10.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Discount (10%)</span>
                    <span className="font-medium text-green-600">-$6.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-lg text-orange-600">$54.00</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Automatic Pricing:</strong> Base price calculated from room hourly rate and duration</li>
              <li><strong>Additional Fees:</strong> Add extra charges for services, equipment, or special requests</li>
              <li><strong>Discounts:</strong> Apply percentage or fixed amount discounts</li>
              <li><strong>Total Calculation:</strong> System automatically calculates: Base Price + Additional Fees - Discounts</li>
              <li><strong>Room Rates:</strong> Each room has configurable hourly rates shown in room selection</li>
            </ul>
          </section>

          {/* Room Management */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Room Management
            </h3>
            
            {/* Room Types Visual Guide */}
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-4 mb-3">
                <Users className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Room Types & Capacity</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">S</span>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Small Room</div>
                  <div className="text-xs text-gray-500">2-4 people</div>
                  <div className="text-xs text-green-600 font-medium">$20/hr</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">M</span>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Medium Room</div>
                  <div className="text-xs text-gray-500">4-6 people</div>
                  <div className="text-xs text-blue-600 font-medium">$25/hr</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">L</span>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Large Room</div>
                  <div className="text-xs text-gray-500">6-8 people</div>
                  <div className="text-xs text-purple-600 font-medium">$30/hr</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">P</span>
                  </div>
                  <div className="text-xs font-medium text-gray-700">Party Room</div>
                  <div className="text-xs text-gray-500">8-12 people</div>
                  <div className="text-xs text-orange-600 font-medium">$40/hr</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Room Settings:</strong> Access via Settings → Rooms to add/edit room details</li>
              <li><strong>Room Properties:</strong> Name, capacity, hourly rate, color, and availability status</li>
              <li><strong>Room Types:</strong> Different room sizes (small, medium, large, party) with color coding</li>
              <li><strong>Availability:</strong> Enable/disable rooms for booking and set maintenance status</li>
              <li><strong>Capacity Display:</strong> Room capacity shown in booking form and room lists</li>
            </ul>
          </section>

          {/* Business Hours & Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Business Hours & Settings
            </h3>
            
            {/* Business Hours Visual */}
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-4 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Business Hours Configuration</span>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Monday - Friday</span>
                    <span className="font-medium text-indigo-600">9:00 AM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Saturday</span>
                    <span className="font-medium text-indigo-600">10:00 AM - 12:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Sunday</span>
                    <span className="font-medium text-indigo-600">11:00 AM - 10:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Business Hours:</strong> Set operating hours for each day of the week via Settings → Business Hours</li>
              <li><strong>Time Zone:</strong> Configure your business timezone for accurate time display</li>
              <li><strong>Time Format:</strong> Choose between 12-hour and 24-hour time display</li>
              <li><strong>Layout Orientations:</strong> Switch between Vertical (Rooms × Time) and Horizontal (Time × Rooms) layouts</li>
              <li><strong>Slot Sizing:</strong> Adjust time slot width and height for better visibility</li>
              <li><strong>Field Customization:</strong> Customize form fields, labels, and validation rules in Settings → Form Fields</li>
              <li><strong>Automatic Migration:</strong> Settings automatically update to use the latest standardized field labels</li>
            </ul>
          </section>

          {/* Display & Customization */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              Display & Customization
            </h3>
            
            {/* Color Coding Visual Guide */}
            <div className="mb-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm font-medium text-pink-800">🎨 Color Coding by Source</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-white p-2 rounded border text-center">
                  <div className="w-6 h-6 bg-green-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-700">Walk-in</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="w-6 h-6 bg-blue-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-700">Phone</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="w-6 h-6 bg-purple-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-700">Email</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="w-6 h-6 bg-orange-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-700">Online</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="w-6 h-6 bg-pink-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-700">App</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Color Coding:</strong> Enable color by booking source (Walk-in, Phone, Email, Online, App) or room type</li>
              <li><strong>Custom Colors:</strong> Adjust colors for each booking source in Settings → Display</li>
              <li><strong>Form Fields:</strong> Customize which fields appear in booking forms via Settings → Form Fields</li>
              <li><strong>Consistent Labels:</strong> All form fields use standardized sentence case for better readability</li>
              <li><strong>Live Preview:</strong> See changes in real-time as you adjust settings</li>
              <li><strong>Theme Options:</strong> Choose between different visual themes and color schemes</li>
            </ul>
          </section>

          {/* Recent Improvements */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Recent Improvements
            </h3>
            
            {/* Recent Improvements Visual */}
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm font-medium text-emerald-800">✨ Latest Updates</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Synchronized Indicators</span>
                  </div>
                  <div className="text-xs text-gray-600">Red time line and slot highlighting are perfectly aligned</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">📝</span>
                    <span className="text-xs font-medium text-gray-700">Standardized Labels</span>
                  </div>
                  <div className="text-xs text-gray-600">All form fields use consistent sentence case</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">⚙️</span>
                    <span className="text-xs font-medium text-gray-700">Auto Migration</span>
                  </div>
                  <div className="text-xs text-gray-600">Settings automatically update to latest standards</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">🎯</span>
                    <span className="text-xs font-medium text-gray-700">Enhanced UX</span>
                  </div>
                  <div className="text-xs text-gray-600">Improved user experience and interface consistency</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Perfect Time Synchronization:</strong> Red time indicators and slot highlighting now move together seamlessly</li>
              <li><strong>Consistent Field Labels:</strong> All form fields use standardized sentence case (e.g., "Customer name" instead of "customerName")</li>
              <li><strong>Automatic Settings Migration:</strong> Your existing settings automatically update to use the new standardized labels</li>
              <li><strong>Enhanced Visual Feedback:</strong> Time indicators provide better visual feedback with perfect alignment</li>
              <li><strong>Improved Form Experience:</strong> More professional and consistent form field presentation</li>
            </ul>
          </section>

          {/* Advanced Features */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Advanced Features
            </h3>
            
            {/* Advanced Features Visual */}
            <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm font-medium text-teal-800">⚡ Advanced Capabilities</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">Real-time Updates</span>
                  </div>
                  <div className="text-xs text-gray-600">Live sync across multiple users</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">🔍</span>
                    <span className="text-xs font-medium text-gray-700">Search & Filter</span>
                  </div>
                  <div className="text-xs text-gray-600">Advanced booking search</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">📦</span>
                    <span className="text-xs font-medium text-gray-700">Bulk Operations</span>
                  </div>
                  <div className="text-xs text-gray-600">Batch actions on multiple bookings</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">📊</span>
                    <span className="text-xs font-medium text-gray-700">Export Data</span>
                  </div>
                  <div className="text-xs text-gray-600">Reports and analysis</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Real-time Updates:</strong> WebSocket integration for live booking updates across multiple users</li>
              <li><strong>Search & Filter:</strong> Advanced booking search by customer, room, date, or status</li>
              <li><strong>Bulk Operations:</strong> Select multiple bookings for batch actions (cancel, delete, restore)</li>
              <li><strong>Export Data:</strong> Export booking data for reporting and analysis</li>
              <li><strong>Keyboard Shortcuts:</strong> Use keyboard shortcuts for common actions (coming soon)</li>
            </ul>
          </section>

          {/* Tips & Best Practices */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Tips & Best Practices
            </h3>
            
            {/* Mobile Usage Visual Guide */}
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-4 mb-3">
                <Smartphone className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Mobile Usage Tips</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-lg mb-2">👆</div>
                  <div className="text-xs font-medium text-gray-700">Tap & Hold</div>
                  <div className="text-xs text-gray-600">For drag operations</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-lg mb-2">🤏</div>
                  <div className="text-xs font-medium text-gray-700">Pinch to Zoom</div>
                  <div className="text-xs text-gray-600">Better visibility</div>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <div className="text-lg mb-2">⚡</div>
                  <div className="text-xs font-medium text-gray-700">Quick Actions</div>
                  <div className="text-xs text-gray-600">Floating + button</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Quick Actions:</strong> Use the floating + button for rapid booking creation at current time</li>
              <li><strong>Notes Preview:</strong> Booking notes appear as white text on colored backgrounds for readability</li>
              <li><strong>Drag Performance:</strong> For best drag-and-drop performance, avoid very long bookings</li>
              <li><strong>Mobile Usage:</strong> On mobile, use tap-and-hold for drag operations and pinch-to-zoom for better visibility</li>
              <li><strong>Data Persistence:</strong> All settings and preferences are automatically saved to your browser</li>
              <li><strong>Error Handling:</strong> The app validates business hours, phone numbers, and booking conflicts automatically</li>
            </ul>
          </section>

          {/* Troubleshooting */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              Troubleshooting
            </h3>
            
            {/* Error Prevention Visual */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-sm font-medium text-gray-800">⚠️ Common Issues & Solutions</span>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-red-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-red-500 text-xs">❌</span>
                    <span className="text-xs font-medium text-red-700">Booking Conflict</span>
                  </div>
                  <div className="text-xs text-gray-600">Overlapping bookings are automatically prevented</div>
                </div>
                <div className="bg-white p-3 rounded border border-orange-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-orange-500 text-xs">⏰</span>
                    <span className="text-xs font-medium text-orange-700">Outside Hours</span>
                  </div>
                  <div className="text-xs text-gray-600">Bookings outside business hours are rejected</div>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-blue-500 text-xs">📱</span>
                    <span className="text-xs font-medium text-blue-700">Phone Format</span>
                  </div>
                  <div className="text-xs text-gray-600">8-16 digits starting with 1-9 required</div>
                </div>
              </div>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li><strong>Booking Conflicts:</strong> System prevents double-booking; check for overlapping times</li>
              <li><strong>Business Hours:</strong> Bookings outside business hours will be rejected with clear error messages</li>
              <li><strong>Phone Validation:</strong> Phone numbers must be 8-16 digits starting with 1-9</li>
              <li><strong>Performance:</strong> For large datasets, use filters to improve loading speed</li>
              <li><strong>Browser Support:</strong> Works best on modern browsers (Chrome, Firefox, Safari, Edge)</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructionsModal;


