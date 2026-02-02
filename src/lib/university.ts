const UNIVERSITY_DOMAINS: Record<string, { name: string; shortName: string; color: string }> = {
  'kabarak.ac.ke': { name: 'Kabarak University', shortName: 'KBU', color: 'from-red-600 to-orange-500' },
  'students.kabarak.ac.ke': { name: 'Kabarak University', shortName: 'KBU', color: 'from-red-600 to-orange-500' },
  'strathmore.edu': { name: 'Strathmore University', shortName: 'SU', color: 'from-blue-600 to-indigo-500' },
  'uonbi.ac.ke': { name: 'University of Nairobi', shortName: 'UoN', color: 'from-green-600 to-emerald-500' },
  'ku.ac.ke': { name: 'Kenyatta University', shortName: 'KU', color: 'from-maroon-600 to-red-500' },
  'jkuat.ac.ke': { name: 'JKUAT', shortName: 'JKUAT', color: 'from-green-700 to-emerald-600' },
  'mku.ac.ke': { name: 'Mount Kenya University', shortName: 'MKU', color: 'from-blue-700 to-indigo-600' },
  'dkut.ac.ke': { name: 'Dedan Kimathi University', shortName: 'DeKUT', color: 'from-purple-600 to-indigo-500' },
  'mu.ac.ke': { name: 'Moi University', shortName: 'MU', color: 'from-orange-600 to-amber-500' },
  'egerton.ac.ke': { name: 'Egerton University', shortName: 'EU', color: 'from-green-600 to-teal-500' },
  'tuk.ac.ke': { name: 'Technical University of Kenya', shortName: 'TUK', color: 'from-blue-600 to-cyan-500' },
  'mmust.ac.ke': { name: 'Masinde Muliro University', shortName: 'MMUST', color: 'from-red-600 to-pink-500' },
  'pu.ac.ke': { name: 'Pwani University', shortName: 'PU', color: 'from-cyan-600 to-blue-500' },
  'msu.ac.ke': { name: 'Maseno University', shortName: 'MSU', color: 'from-blue-600 to-indigo-500' },
  'cuea.edu': { name: 'Catholic University of Eastern Africa', shortName: 'CUEA', color: 'from-blue-700 to-blue-500' },
};

export function getUniversityFromEmail(email: string | null | undefined): { name: string; shortName: string; color: string } | null {
  if (!email) return null;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  // Check exact match first
  if (UNIVERSITY_DOMAINS[domain]) {
    return UNIVERSITY_DOMAINS[domain];
  }
  
  // Check if domain ends with any known university domain
  for (const [uniDomain, info] of Object.entries(UNIVERSITY_DOMAINS)) {
    if (domain.endsWith(uniDomain)) {
      return info;
    }
  }
  
  return null;
}

export function isUniversityEmail(email: string | null | undefined): boolean {
  return getUniversityFromEmail(email) !== null;
}
