
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drieafysqighpgtyrnbu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaWVhZnlzcWlnaHBndHlybmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NjA4MjUsImV4cCI6MjA1ODEzNjgyNX0.Zrm18_zH4mYg0BSWPbmAim__BGWpSKSImo70tHgX5T8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
