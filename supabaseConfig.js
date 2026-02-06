// supabaseConfig.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jgzxtleleutynikfbmdo.supabase.co';  // Add your URL from Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnenh0bGVsZXV0eW5pa2ZibWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDAwMzQsImV4cCI6MjA4NTk3NjAzNH0.A6wll4WFjfAOEPwB1YGYzbuKjihjZHSpWv0MPGP-iCY';  // Add your key from Supabase

export const supabase = createClient(supabaseUrl, supabaseAnonKey);