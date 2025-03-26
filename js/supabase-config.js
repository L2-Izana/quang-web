// Initialize Supabase client
// Copy your Supabase URL and anon key from your Supabase project dashboard
const SUPABASE_URL = 'https://vvkyfyueakbzmhcdeclk.supabase.co';  
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a3lmeXVlYWtiem1oY2RlY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzU2NTksImV4cCI6MjA1ODMxMTY1OX0.X7lmIgW5S_bSqpNQHsiJjYFJ25Wpk9KwyYjIlAZJKJw';  

// Fix the variable naming conflict - don't use 'supabase' for both the library and client instance
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 