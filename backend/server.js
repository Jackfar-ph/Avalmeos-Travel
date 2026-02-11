const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/database');
const { authenticateToken, requireAdmin, generateToken } = require('./middleware/auth');
const emailService = require('./services/email-service');
const { 
  validateDestinationCreate, 
  validateDestinationUpdate, 
  validateDestinationId,
  validateActivityCreate, 
  validateActivityUpdate, 
  validateActivityId,
  validatePackageCreate, 
  validatePackageUpdate, 
  validatePackageId,
  handleValidationErrors
} = require('./middleware/validation');
const path = require('path');
require('dotenv').config();

// =====================================================
// INITIALIZE DEFAULT ADMIN USER
// =====================================================
async function initializeDefaultAdmin() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Get admin credentials from environment variables with fallback for development
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@avalmeos.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin user exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();
    
    if (!existingAdmin) {
      // Create admin user
      const password_hash = await bcrypt.hash(adminPassword, 10);
      
      const { data: adminUser, error } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          password_hash,
          role: 'admin',
          is_active: true,
          email_verified: true
        })
        .select()
        .single();
      
      if (adminUser) {
        // Create admin profile
        await supabase.from('user_profiles').insert({
          user_id: adminUser.id,
          first_name: 'Admin',
          last_name: 'User'
        });
        
        const envNote = process.env.ADMIN_EMAIL ? '' : ' (set ADMIN_EMAIL and ADMIN_PASSWORD env vars for production)';
        console.log(`✅ Default admin user created: ${adminEmail}${envNote}`);
      } else {
        console.error('Failed to create admin user:', error);
      }
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
}

// Initialize admin on startup
initializeDefaultAdmin();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  undefined // Allow file:// protocol for local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Redirect root to admin.html
app.get('/', (req, res) => {
  res.redirect('/admin.html');
});

// =====================================================
// DEBUG ENDPOINT - RESET ADMIN PASSWORD
// Call: GET /api/debug/reset-admin
// =====================================================
app.get('/api/debug/reset-admin', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const adminEmail = 'admin@avalmeos.com';
        const adminPassword = 'admin123';
        const password_hash = await bcrypt.hash(adminPassword, 10);
        
        // Check if admin exists
        const { data: existingAdmin, error: selectError } = await supabase
            .from('users')
            .select('id, email, role, is_active')
            .eq('email', adminEmail)
            .single();
        
        if (selectError) {
            res.json({ success: false, message: selectError.message });
            return;
        }
        
        if (existingAdmin) {
            // Update password
            const { error } = await supabase
                .from('users')
                .update({ password_hash })
                .eq('email', adminEmail);
            
            if (error) {
                res.json({ success: false, message: error.message });
                return;
            }
            
            res.json({ 
                success: true, 
                message: 'Admin password reset successfully',
                user: existingAdmin
            });
        } else {
            // Create admin user
            const { data: adminUser, error } = await supabase
                .from('users')
                .insert({
                    email: adminEmail,
                    password_hash,
                    role: 'admin',
                    is_active: true,
                    email_verified: true
                })
                .select('id, email, role, is_active')
                .single();
            
            if (error) {
                res.json({ success: false, message: error.message });
                return;
            }
            
            // Create admin profile
            await supabase.from('user_profiles').insert({
                user_id: adminUser.id,
                first_name: 'Admin',
                last_name: 'User'
            });
            
            res.json({ 
                success: true, 
                message: 'Admin user created successfully',
                user: adminUser
            });
        }
    } catch (error) {
        console.error('Reset admin error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ======================
// AUTH ROUTES
// ======================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;
    
    // Check if user exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const { data: user, error } = await supabase.from('users').insert({
      email,
      password_hash,
      role: 'customer',
      is_active: true,
      email_verified: false
    }).select().single();
    
    if (error) throw error;
    
    // Create profile
    await supabase.from('user_profiles').insert({
      user_id: user.id,
      first_name,
      last_name
    });
    
    const token = generateToken(user);
    res.status(201).json({ success: true, message: 'Registration successful', data: { user: { id: user.id, email: user.email, role: user.role }, token } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[Login] Attempting login for:', email);
    const bcrypt = require('bcryptjs');
    
    // Find user
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email).eq('is_active', true);
    if (error) {
        console.log('[Login] Supabase error:', error);
        throw error;
    }
    
    console.log('[Login] Users found:', users.length);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    console.log('[Login] User found:', user.email, 'ID:', user.id);
    console.log('[Login] Stored password_hash:', user.password_hash);
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('[Login] Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Get user profile
    const { data: profiles } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
    const profile = profiles || {};
    
    const token = generateToken(user);
    const refreshToken = require('crypto').randomBytes(64).toString('hex');
    
    // Store refresh token in database (for production, use a separate table)
    // For demo, we'll include it in response
    res.json({ 
      success: true, 
      message: 'Login successful', 
      data: { 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          first_name: profile.first_name || 'Admin',
          last_name: profile.last_name || ''
        }, 
        token,
        refreshToken,
        expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from('users').select('id, email, role, created_at').eq('id', req.user.id).single();
    if (error) throw error;
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    
    // For demo purposes, we accept any refresh token and issue a new access token
    // In production, validate the refresh token against stored tokens
    
    // Verify the user exists and is active
    // Since we don't store refresh tokens in database yet, we'll issue a new token
    // for any valid user ID embedded in the token (if token was valid before)
    
    // For demo: Generate new token without validation (since we don't store refresh tokens)
    // In production, you would:
    // 1. Look up refresh token in database
    // 2. Verify it hasn't expired
n    // 3. Get the user associated with it
    // 4. Issue new access token
    
    // Generate new access token (simplified - in production validate refresh token first)
    const jwt = require('jsonwebtoken');
    
    // For demo: decode old token to get user info (if provided in body)
    let userData = req.body.userData;
    if (!userData && refreshToken) {
      try {
        // Try to decode (won't verify, just extract payload for demo)
        const decoded = jwt.decode(refreshToken);
        if (decoded) {
          userData = decoded;
        }
      } catch (e) {
        // Ignore decode errors
      }
    }
    
    if (userData && userData.id) {
      // Get user from database
      const { data: user, error } = await supabase.from('users').select('*').eq('id', userData.id).eq('is_active', true).single();
      
      if (!error && user) {
        const newToken = generateToken(user);
        const newRefreshToken = require('crypto').randomBytes(64).toString('hex');
        
        res.json({
          success: true,
          data: {
            token: newToken,
            refreshToken: newRefreshToken,
            expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
          }
        });
        return;
      }
    }
    
    // If we can't validate, check if it's a demo refresh token format
    if (refreshToken && refreshToken.startsWith('demo_')) {
      // Demo mode - issue new token for admin
      const demoUser = {
        id: 'demo-admin-id',
        email: 'admin@avalmeos.com',
        role: 'admin'
      };
      const newToken = generateToken(demoUser);
      
      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: require('crypto').randomBytes(64).toString('hex'),
          expiresIn: 7 * 24 * 60 * 60 * 1000
        }
      });
      return;
    }
    
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  // In a real app, you would invalidate the refresh token here
  res.json({ success: true, message: 'Logged out successfully' });
});

// ======================
// DESTINATIONS ROUTES
// ======================

app.get('/api/destinations', async (req, res) => {
  try {
    const { featured, search } = req.query;
    let query = supabase.from('destinations').select('*').eq('is_active', true);
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/destinations/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('destinations').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// ACTIVITIES ROUTES
// ======================

app.get('/api/activities', async (req, res) => {
  try {
    const { destination_id, featured, search } = req.query;
    let query = supabase.from('activities').select('*, destinations(*)').eq('is_active', true);
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities').select('*, destinations(*)').eq('id', req.params.id).single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// BOOKINGS ROUTES (User)
// ======================

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { guest_name, guest_email, guest_phone, activities, special_requests } = req.body;
    
    // Generate booking reference
    const booking_reference = 'AVL' + Date.now().toString(36).toUpperCase();
    
    // Calculate total
    const total_amount = activities.reduce((sum, a) => sum + (a.price_per_person * a.participants), 0);
    
    // Create booking
    const { data: booking, error } = await supabase.from('bookings').insert({
      booking_reference,
      user_id: req.user.id,
      guest_name,
      guest_email,
      guest_phone,
      total_amount,
      final_amount: total_amount,
      status: 'pending',
      special_requests,
      created_by: req.user.id
    }).select().single();
    
    if (error) throw error;
    
    // Create booking activities
    const bookingActivities = activities.map(a => ({
      booking_id: booking.id,
      activity_id: a.activity_id,
      participants: a.participants,
      activity_date: a.activity_date,
      activity_time: a.activity_time,
      price_per_person: a.price_per_person,
      subtotal: a.price_per_person * a.participants
    }));
    
    await supabase.from('booking_activities').insert(bookingActivities);
    
    res.status(201).json({ success: true, message: 'Booking created successfully', data: booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/bookings/my', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings')
      .select('*, booking_activities(*, activities(*, destinations(*)))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// INQUIRIES ROUTES
// ======================

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, subject, message, inquiry_type } = req.body;
    
    const { data, error } = await supabase.from('inquiries').insert({
      name: name || 'Anonymous',
      email: email || null,
      phone: phone || null,
      subject: subject || 'General Inquiry',
      message: message || '',
      inquiry_type: inquiry_type || 'general',
      status: 'new',
      priority: 'normal'
    }).select().single();
    
    if (error) {
      console.error('Supabase inquiry error:', error);
      throw error;
    }
    
    res.status(201).json({ success: true, message: 'Inquiry sent successfully', data });
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ======================
// ADMIN ROUTES
// ======================

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get counts
    const [{ count: totalBookings }, { count: totalUsers }, { count: totalDestinations }, { count: totalInquiries }] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('destinations').select('id', { count: 'exact', head: true }),
      supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new')
    ]);
    
    // Get recent bookings
    const { data: recentBookings } = await supabase.from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalBookings,
        totalUsers,
        totalDestinations,
        totalInquiries,
        recentBookings
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard stats endpoint (simplified for dashboard view)
app.get('/api/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get counts from various tables
    const [usersResult, bookingsResult, destinationsResult, packagesResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('destinations').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('packages').select('id', { count: 'exact' }).eq('is_active', true)
    ]);
    
    // Get total revenue from confirmed/completed bookings
    const { data: revenueData } = await supabase.from('bookings')
      .select('total_amount')
      .in('status', ['confirmed', 'completed']);
    
    const totalRevenue = revenueData?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0;
    
    res.json({
      success: true,
      data: {
        totalUsers: usersResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        pendingBookings: bookingsResult.count || 0,
        totalDestinations: destinationsResult.count || 0,
        totalPackages: packagesResult.count || 0,
        totalRevenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Recent bookings endpoint
app.get('/api/admin/bookings/recent', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const { data, error } = await supabase.from('bookings')
      .select('*, booking_activities(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Recent bookings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Booking trends endpoint
app.get('/api/admin/analytics/booking-trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase.from('bookings')
      .select('created_at, status, total_amount')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group by date
    const trends = {};
    data?.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      if (!trends[date]) trends[date] = { count: 0, revenue: 0 };
      trends[date].count++;
      trends[date].revenue += parseFloat(booking.total_amount || 0);
    });
    
    res.json({ success: true, data: trends });
  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Top destinations endpoint
app.get('/api/admin/analytics/top-destinations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const { data, error } = await supabase.from('destinations')
      .select('name, total_reviews, average_rating')
      .eq('is_active', true)
      .order('total_reviews', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Top destinations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Revenue stats endpoint
app.get('/api/admin/analytics/revenue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: allBookings } = await supabase.from('bookings')
      .select('total_amount, status, created_at')
      .in('status', ['confirmed', 'completed']);
    
    const totalRevenue = allBookings?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0;
    const avgBookingValue = allBookings?.length ? totalRevenue / allBookings.length : 0;
    
    // Calculate month-over-month change (simplified)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const lastMonthRevenue = allBookings?.filter(b => new Date(b.created_at) >= lastMonth)
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0;
    
    const changePercent = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      data: {
        totalRevenue,
        avgBookingValue,
        changePercent,
        totalBookings: allBookings?.length || 0
      }
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings')
      .select('*, booking_activities(*, activities(*))')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/admin/bookings/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase.from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/inquiries', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.patch('/api/admin/inquiries/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, response, sendReplyEmail } = req.body;
    const inquiryId = req.params.id;
    
    // Get current inquiry details first
    const { data: existingInquiry, error: fetchError } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // If response is provided and sendReplyEmail is true, send email reply
    if (response && sendReplyEmail === true && existingInquiry.email) {
      console.log(`[Inquiry] Sending reply email to: ${existingInquiry.email}`);
      
      const adminName = req.user?.email || 'Avalmeo\'s Travel Team';
      const emailResult = await emailService.sendInquiryReply({
        to: existingInquiry.email,
        customerName: existingInquiry.name,
        subject: existingInquiry.subject,
        replyMessage: response,
        adminName: adminName
      });
      
      if (!emailResult.success) {
        console.error('[Inquiry] Failed to send reply email:', emailResult.error);
      }
    }
    
    // Update the inquiry record
    const { data, error } = await supabase.from('inquiries')
      .update({ 
        status: status || existingInquiry.status, 
        response: response || existingInquiry.response, 
        responded_at: response ? new Date().toISOString() : existingInquiry.responded_at
      })
      .eq('id', inquiryId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      data,
      emailSent: response && sendReplyEmail === true
    });
  } catch (error) {
    console.error('Inquiry update error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ======================
// ADMIN DESTINATIONS CRUD (with validation)
// ======================

// Get all destinations (admin view - includes inactive)
app.get('/api/admin/destinations/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('destinations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias for destinations (without /all) - same as /all
app.get('/api/admin/destinations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('destinations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create destination with validation
app.post('/api/admin/destinations', authenticateToken, requireAdmin, validateDestinationCreate, handleValidationErrors, async (req, res) => {
  try {
    const { name, slug, description, short_description, location, region, country, latitude, longitude, hero_image, highlights, best_time_to_visit, average_rating, total_reviews, is_featured, is_active, created_by } = req.body;
    
    const { data, error } = await supabase.from('destinations').insert({
      name, slug, description, short_description, location, region, country: country || 'Philippines', 
      latitude, longitude, hero_image, highlights, best_time_to_visit, average_rating: average_rating || 0, 
      total_reviews: total_reviews || 0, is_featured: is_featured || false, is_active: is_active !== false, created_by
    }).select().single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('destinations', 'CREATE', data);
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single destination (admin view)
app.get('/api/admin/destinations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update destination with validation
app.put('/api/admin/destinations/:id', authenticateToken, requireAdmin, validateDestinationUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('destinations', 'UPDATE', data);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Soft delete (deactivate) destination
app.patch('/api/admin/destinations/:id/deactivate', authenticateToken, requireAdmin, validateDestinationId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('destinations', 'DELETE', data);
    
    res.json({ success: true, data, message: 'Destination deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore (activate) destination
app.patch('/api/admin/destinations/:id/activate', authenticateToken, requireAdmin, validateDestinationId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('destinations', 'UPDATE', data);
    
    res.json({ success: true, data, message: 'Destination activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Permanent delete destination
app.delete('/api/admin/destinations/:id', authenticateToken, requireAdmin, validateDestinationId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get data before delete for broadcast
    const { data: deletedData } = await supabase.from('destinations').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('destinations', 'DELETE', deletedData);
    
    res.json({ success: true, message: 'Destination permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ADMIN ACTIVITIES CRUD (with validation)
// ======================

// Get all activities (admin view - includes inactive)
app.get('/api/admin/activities/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, search } = req.query;
    let query = supabase.from('activities').select('*, destinations(*)').order('created_at', { ascending: false });
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias for activities (without /all) - same as /all
app.get('/api/admin/activities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, search } = req.query;
    let query = supabase.from('activities').select('*, destinations(*)').order('created_at', { ascending: false });
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create activity with validation
app.post('/api/admin/activities', authenticateToken, requireAdmin, validateActivityCreate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities')
      .insert({ ...req.body, created_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    
    // Get full activity data with destination for broadcast
    const { data: fullData } = await supabase.from('activities')
      .select('*, destinations(*)')
      .eq('id', data.id)
      .single();
    
    // Broadcast to realtime channels
    broadcastChange('activities', 'CREATE', fullData);
    
    res.status(201).json({ success: true, data: fullData });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update activity with validation
app.put('/api/admin/activities/:id', authenticateToken, requireAdmin, validateActivityUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('activities')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Get full activity data with destination for broadcast
    const { data: fullData } = await supabase.from('activities')
      .select('*, destinations(*)')
      .eq('id', id)
      .single();
    
    // Broadcast to realtime channels
    broadcastChange('activities', 'UPDATE', fullData);
    
    res.json({ success: true, data: fullData });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Soft delete (deactivate) activity
app.patch('/api/admin/activities/:id/deactivate', authenticateToken, requireAdmin, validateActivityId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('activities')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('activities', 'DELETE', data);
    
    res.json({ success: true, data, message: 'Activity deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore (activate) activity
app.patch('/api/admin/activities/:id/activate', authenticateToken, requireAdmin, validateActivityId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('activities')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('activities', 'UPDATE', data);
    
    res.json({ success: true, data, message: 'Activity activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Permanent delete activity
app.delete('/api/admin/activities/:id', authenticateToken, requireAdmin, validateActivityId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get data before delete for broadcast
    const { data: deletedData } = await supabase.from('activities').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('activities', 'DELETE', deletedData);
    
    res.json({ success: true, message: 'Activity permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ADMIN USERS MANAGEMENT
// ======================

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('users')
      .select('*, user_profiles(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format user data with name from profile
    const formatted = data.map(user => ({
      ...user,
      name: user.user_profiles ? `${user.user_profiles.first_name} ${user.user_profiles.last_name}` : user.email
    }));
    
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { data, error } = await supabase.from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    const { data, error } = await supabase.from('users')
      .update({ is_active })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ADMIN ANALYTICS
// ======================

app.get('/api/admin/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get booking trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: bookings } = await supabase.from('bookings')
      .select('created_at, status, total_amount, guest_name, package_name')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(20);
    
    // Get top destinations by bookings
    const { data: topDestinations } = await supabase.from('destinations')
      .select('id, name, total_reviews, average_rating')
      .eq('is_active', true)
      .order('total_reviews', { ascending: false })
      .limit(5);
    
    // Calculate booking trends by date
    const trends = {};
    bookings?.forEach(booking => {
      const date = booking.created_at.split('T')[0];
      if (!trends[date]) trends[date] = { count: 0, revenue: 0 };
      trends[date].count++;
      trends[date].revenue += parseFloat(booking.total_amount || 0);
    });
    
    // Calculate stats
    const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0;
    
    res.json({
      success: true,
      data: {
        stats: {
          total_revenue: totalRevenue,
          total_bookings: bookings?.length || 0,
          pending_bookings: bookings?.filter(b => b.status === 'pending').length || 0
        },
        recent_bookings: bookings || [],
        booking_trends: trends,
        top_destinations: topDestinations || []
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// PUBLIC PACKAGES API (for realtime sync)
// ======================

// Get all packages (public - active only)
app.get('/api/packages', async (req, res) => {
  try {
    const { featured, search, destination_id } = req.query;
    let query = supabase.from('packages').select('*, destinations(*)').eq('is_active', true);
    
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single package (public)
app.get('/api/packages/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages')
      .select('*, destinations(*)')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ADMIN PACKAGES CRUD (with validation)
// ======================

// Get all packages (admin view - includes inactive)
app.get('/api/admin/packages/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, search, is_featured, is_active } = req.query;
    let query = supabase.from('packages').select('*, destinations(*)').order('created_at', { ascending: false });
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (is_featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias for packages (without /all) - same as /all
app.get('/api/admin/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { destination_id, search, is_featured, is_active } = req.query;
    let query = supabase.from('packages').select('*, destinations(*)').order('created_at', { ascending: false });
    
    if (destination_id) {
      query = query.eq('destination_id', destination_id);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (is_featured === 'true') {
      query = query.eq('is_featured', true);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create package with validation
app.post('/api/admin/packages', authenticateToken, requireAdmin, validatePackageCreate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages')
      .insert({ ...req.body, created_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    
    // Get full package data with destination for broadcast
    const { data: fullData } = await supabase.from('packages')
      .select('*, destinations(*)')
      .eq('id', data.id)
      .single();
    
    // Broadcast to realtime channels
    broadcastChange('packages', 'CREATE', fullData);
    
    res.status(201).json({ success: true, data: fullData });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update package with validation
app.put('/api/admin/packages/:id', authenticateToken, requireAdmin, validatePackageUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('packages')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Get full package data with destination for broadcast
    const { data: fullData } = await supabase.from('packages')
      .select('*, destinations(*)')
      .eq('id', id)
      .single();
    
    // Broadcast to realtime channels
    broadcastChange('packages', 'UPDATE', fullData);
    
    res.json({ success: true, data: fullData });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Soft delete (deactivate) package
app.patch('/api/admin/packages/:id/deactivate', authenticateToken, requireAdmin, validatePackageId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('packages')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('packages', 'DELETE', data);
    
    res.json({ success: true, data, message: 'Package deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restore (activate) package
app.patch('/api/admin/packages/:id/activate', authenticateToken, requireAdmin, validatePackageId, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('packages')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('packages', 'UPDATE', data);
    
    res.json({ success: true, data, message: 'Package activated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Permanent delete package
app.delete('/api/admin/packages/:id', authenticateToken, requireAdmin, validatePackageId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get data before delete for broadcast
    const { data: deletedData } = await supabase.from('packages').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
    
    // Broadcast to realtime channels
    broadcastChange('packages', 'DELETE', deletedData);
    
    res.json({ success: true, message: 'Package permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// REALTIME BROADCAST FUNCTION
// ======================

function broadcastChange(table, operation, data) {
  // Store change in a dedicated table for realtime sync
  supabase.from('realtime_events').insert({
    table_name: table,
    operation: operation,
    record_data: data,
    created_at: new Date().toISOString()
  }).then().catch(console.error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Avalmeo's Travel API running on http://localhost:${PORT}`);
  console.log(`   Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
