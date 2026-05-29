-- database/seed/bhopal_hospitals.sql
-- Run this AFTER 001_initial_schema.sql
-- Seeds real Bhopal hospital data into the system

INSERT INTO hospitals (name, description, address, city, state, pincode, phone, email, latitude, longitude, emergency_available, facilities, rating, total_reviews, is_active)
VALUES
(
  'AIIMS Bhopal',
  'All India Institute of Medical Sciences Bhopal — premier government medical institution providing world-class healthcare free of cost.',
  'Saket Nagar, Medical College Campus',
  'Bhopal', 'Madhya Pradesh', '462020',
  '0755-2672335', 'director@aiimsbhopal.edu.in',
  23.1993, 77.3149,
  true,
  ARRAY['ICU', 'NICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'MRI', 'CT Scan', 'Blood Bank', 'Ambulance', 'Dialysis'],
  4.5, 2840, true
),
(
  'Hamidia Hospital',
  'Government hospital and teaching hospital of Gandhi Medical College. Largest government hospital in Bhopal with 1200+ beds.',
  'Royal Market, Sultania Road',
  'Bhopal', 'Madhya Pradesh', '462001',
  '0755-2540222', NULL,
  23.2647, 77.4098,
  true,
  ARRAY['ICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'Blood Bank', 'Ambulance', 'Burns Unit'],
  3.8, 1920, true
),
(
  'Bansal Hospital',
  'Leading private multispecialty hospital in Bhopal. Known for cardiac surgery, neurology and orthopedics with advanced equipment.',
  'C-Sector, Shahpura',
  'Bhopal', 'Madhya Pradesh', '462016',
  '0755-4000000', 'info@bansalhospital.com',
  23.2096, 77.4651,
  true,
  ARRAY['ICU', 'NICU', 'OT', 'Lab', 'Pharmacy', 'MRI', 'CT Scan', 'Cafeteria', 'Parking', 'Blood Bank'],
  4.3, 3120, true
),
(
  'Chirayu Medical College & Hospital',
  'Private medical college hospital with 750 beds in Bairagarh. All specialties available with qualified faculty doctors.',
  'Bairagarh, Near Airport',
  'Bhopal', 'Madhya Pradesh', '462030',
  '0755-2763000', 'info@chirayuhospital.com',
  23.2741, 77.3340,
  true,
  ARRAY['ICU', 'NICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'MRI', 'CT Scan', 'Ambulance', 'Cafeteria'],
  4.1, 2200, true
),
(
  'People''s Hospital',
  'People''s Medical College Hospital in Bhanpur. Private hospital with 400 beds known for patient care and modern facilities.',
  'Bhanpur, Bypass Road',
  'Bhopal', 'Madhya Pradesh', '462037',
  '0755-4073000', 'info@peopleshospital.in',
  23.1766, 77.4425,
  true,
  ARRAY['ICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'CT Scan', 'Ambulance', 'Parking'],
  4.2, 1850, true
),
(
  'Bhopal Memorial Hospital & Research Centre',
  'Trust hospital set up for gas tragedy survivors. Provides free care to Bhopal gas victims and subsidized care to general public.',
  'Raisen Road, Bhopal',
  'Bhopal', 'Madhya Pradesh', '462038',
  '0755-2740762', 'bmhrc@nic.in',
  23.3052, 77.3983,
  true,
  ARRAY['ICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'MRI', 'Ambulance', 'Pulmonology'],
  4.0, 980, true
),
(
  'Gandhi Medical College Hospital',
  'Government medical college and hospital. Affordable treatment across all specialties. Associated with Hamidia Hospital.',
  'Sultania Road',
  'Bhopal', 'Madhya Pradesh', '462001',
  '0755-2574927', NULL,
  23.2566, 77.4039,
  true,
  ARRAY['ICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'Blood Bank'],
  3.9, 1100, true
),
(
  'Apollo Sage Hospital',
  'Premium multispecialty hospital by Apollo group in Bhopal. International standard care with experienced doctors.',
  'Bawadia Kalan, Airport Road',
  'Bhopal', 'Madhya Pradesh', '462026',
  '0755-6700000', 'bhopal@apollosage.in',
  23.2450, 77.3560,
  true,
  ARRAY['ICU', 'NICU', 'OT', 'Lab', 'Pharmacy', 'MRI', 'CT Scan', 'PET Scan', 'Blood Bank', 'Cafeteria', 'Parking'],
  4.4, 2650, true
),
(
  'Narmada Hospital',
  'Private hospital on Kolar Road. Good for general medicine, orthopedics and gynecology. Affordable private care.',
  'Kolar Road',
  'Bhopal', 'Madhya Pradesh', '462042',
  '0755-2441000', NULL,
  23.1634, 77.4512,
  false,
  ARRAY['OT', 'Lab', 'Pharmacy', 'X-Ray', 'Parking'],
  4.0, 620, true
),
(
  'Spandan Hospital',
  'Private hospital on Hoshangabad Road. Known for cardiac care and general surgery.',
  'Hoshangabad Road, Near Danish Kunj',
  'Bhopal', 'Madhya Pradesh', '462026',
  '0755-2573000', NULL,
  23.2003, 77.4801,
  false,
  ARRAY['ICU', 'OT', 'Lab', 'Pharmacy', 'X-Ray', 'Parking'],
  3.9, 480, true
)
ON CONFLICT DO NOTHING;
