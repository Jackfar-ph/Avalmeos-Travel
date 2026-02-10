const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/database');
const { authenticateToken, requireAdmin, generateToken } = require('./middleware/auth');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
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
    const bcrypt = require('bcryptjs');
    
    // Find user
    const { data: users, error } = await supabase.from('users').select('*').eq('email', email).eq('is_active', true);
    if (error) throw error;
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Get user profile
    const { data: profiles } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
    const profile = profiles || {};
    
    const token = generateToken(user);
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
        token 
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
      name,
      email,
      phone,
      subject,
      message,
      inquiry_type: inquiry_type || 'general',
      status: 'new',
      priority: 'normal'
    }).select().single();
    
    if (error) throw error;
    
    res.status(201).json({ success: true, message: 'Inquiry sent successfully', data });
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    const { status, response } = req.body;
    const { data, error } = await supabase.from('inquiries')
      .update({ status, response, responded_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// ADMIN DESTINATIONS CRUD
// ======================

app.post('/api/admin/destinations', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, short_description, location, region, country, latitude, longitude, hero_image, highlights, best_time_to_visit, average_rating, total_reviews, is_featured, is_active } = req.body;
    
    const { data, error } = await supabase.from('destinations').insert({
      name, slug, description, short_description, location, region, country, latitude, longitude, hero_image, highlights, best_time_to_visit, average_rating, total_reviews, is_featured, is_active
    }).select().single();
    
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/destinations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('destinations')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/destinations/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('destinations').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Destination deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// ADMIN ACTIVITIES CRUD
// ======================

app.get('/api/admin/activities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities')
      .select('*, destinations(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/activities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities')
      .insert({ ...req.body, created_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/activities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('activities')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/activities/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('activities').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Activity deleted' });
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
      .select('created_at, status, total_amount')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    // Get top destinations by bookings
    const { data: topDestinations } = await supabase.from('destinations')
      .select('name, total_reviews, average_rating')
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
    
    res.json({
      success: true,
      data: {
        bookingTrends: trends,
        topDestinations,
        totalRevenue: bookings?.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0) || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ======================
// PUBLIC PACKAGES (for admin packages tab)
// ======================

app.get('/api/packages', async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages').select('*').eq('is_active', true);
    if (error) {
      console.log('Public packages error:', error);
      // Table doesn't exist yet - return empty array
      if (error.code === '42P01' || error.message?.includes('relation "packages" does not exist')) {
        return res.json({ success: true, data: [] });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all packages (including inactive)
app.get('/api/admin/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages').select('*').order('created_at', { ascending: false });
    if (error) {
      console.log('Packages table error:', error);
      // Table doesn't exist yet - return empty array
      if (error.code === '42P01' || error.message?.includes('relation "packages" does not exist')) {
        return res.json({ success: true, data: [] });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.log('Packages catch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/packages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages')
      .insert({ ...req.body, created_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/admin/packages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('packages')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/packages/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('packages').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Package deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
