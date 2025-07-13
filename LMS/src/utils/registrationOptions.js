// src/utils/registrationOptions.js

export const faculties = [
  'Faculty of Agriculture',
  'Faculty of Allied Health Sciences',
  'Faculty of Arts',
  'Faculty of Dental Sciences',
  'Faculty of Engineering',
  'Faculty of Management',
  'Faculty of Medicine',
  'Faculty of Science',
  'Faculty of Veterinary Medicine & Animal Science',
  'Center for Quality Assurance',
  'Financial Administration',
  'Information Technology Center',
  'Internal Audit Division',
  'Library',
  'Senate House',
  'Test faculty'
];

export const departmentsByFaculty = {
  'Faculty of Agriculture': ['Agricultural Biology', 'Agricultural Economics & Business Management', 'Agricultural Engineering', 'Agricultural Extension', 'Animal Science', 'Crop Science', 'Food Science & Technology', 'Soil Science'],
  'Faculty of Allied Health Sciences': ['Medical Laboratory Science', 'Nursing', 'Physiotherapy', 'Radiography/Radiotherapy', 'Pharmacy', 'Basic Sciences'],
  'Faculty of Arts': ['Arabic & Islamic Civilization', 'Archaeology', 'Classical Languages', 'Economics & Statistics', 'Education', 'English', 'English Language Teaching', 'Fine Arts', 'Geography', 'History', 'Information Technology', 'Law', 'Philosophy', 'Psychology', 'Political Science', 'Pali & Buddhist Studies', 'Sinhala', 'Sociology', 'Tamil'],
  'Faculty of Dental Sciences': ['Basic Sciences', 'Community Dental Health', 'Comprehensive Oral Health Care', 'Oral Medicine & Periodontology', 'Oral Pathology', 'Prosthetic Dentistry', 'Restorative Dentistry', 'Oral & Maxillofacial Surgery'],
  'Faculty of Engineering': ['Chemical & Process Engineering', 'Civil Engineering', 'Computer Engineering', 'Electrical & Electronic Engineering', 'Engineering Management', 'Engineering Mathematics', 'Mechanical Engineering', 'Manufacturing & Industrial Engineering'],
  'Faculty of Management': ['Business Finance', 'Human Resource Management', 'Management Studies', 'Marketing Management', 'Operations Management'],
  'Faculty of Medicine': ['Anatomy', 'Anaesthesiology and Critical Care', 'Biochemistry', 'Community Medicine', 'Family Medicine', 'Forensic Medicine', 'Medical Education', 'Medicine', 'Microbiology', 'Obstetrics & Gynecology', 'Paediatrics', 'Parasitology', 'Pathology', 'Pharmacology', 'Physiology', 'Psychiatry', 'Radiology', 'Surgery'],
  'Faculty of Science': ['Botany', 'Chemistry', 'Environmental & Industrial Sciences', 'Geology', 'Mathematics', 'Molecular Biology & Biotechnology', 'Physics', 'Statistics & Computer Science', 'Zoology'],
  'Faculty of Veterinary Medicine & Animal Science': ['Basic Veterinary Sciences', 'Farm Animal Production & Health', 'Veterinary Clinical Sciences', 'Veterinary Pathobiology', 'Veterinary Public Health & Pharmacology'],
  'Information Technology Center': ['ITC']
};

export const typeOfRegistrationOptions = ['Academic', 'Non-Academic', 'Academic Support', 'Other'];

export const staffCategoryOptions = ['Permanent', 'Temporary', 'On Contract', 'Other'];

export const getJobTitles = ({ faculty, typeOfRegistration, staffCategory }) => {
  if (faculty === 'Information Technology Center') {
    return [
      'Director', 'Deputy Director', 'System Analyst Cum Programmer', 'Computer Programmer',
      'Electronic Engineer', 'Instructor', 'Secretary to the Director',
      'Computer Application Assistant', 'Labourer', 'Trainee', 'Intern'
    ];
  }

  if (typeOfRegistration === 'Academic') {
    if (staffCategory === 'Permanent') {
      return ['Professor', 'Lecturer', 'Other'];
    } else if (staffCategory === 'Temporary') {
      return ['Demonstrator', 'Research Assistant', 'Assistant Lecturer', 'Lecturer', 'Other'];
    }
  }

  if (typeOfRegistration === 'Non-Academic') {
    return [
      'Network Manager', 'Programmer Cum System Analyst', 'Computer Programmer',
      'Technical Officer', 'AR', 'SAR', 'AB', 'SAB', 'CAA', 'Clerk',
      'MA', 'LA', 'LIA', 'BB', 'LIBA', 'WA', 'Other'
    ];
  }

  return [];
};


