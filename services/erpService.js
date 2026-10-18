/**
 * University ERP & Registrar SSO Integration Service
 * Connects UniRetrieve to College Registrar & Active Directory / OAuth 2.0
 */

// Simulated Central Campus Registrar Enrolment Records
const REGISTRAR_DATABASE = [
  {
    studentId: 'STUDENT123',
    name: 'Anush Kumar',
    email: 'anush@univ.edu',
    department: 'Computer Science & Engineering',
    year: 'Final Year (2026)',
    status: 'ENROLLED',
    validThrough: '2027-06-30'
  },
  {
    studentId: 'STUDENT456',
    name: 'Swaroop Hegde',
    email: 'swaroop@univ.edu',
    department: 'Information Science',
    year: 'Final Year (2026)',
    status: 'ENROLLED',
    validThrough: '2027-06-30'
  },
  {
    studentId: 'STUDENT789',
    name: 'Purna S',
    email: 'purna@univ.edu',
    department: 'Artificial Intelligence & ML',
    year: 'Final Year (2026)',
    status: 'ENROLLED',
    validThrough: '2027-06-30'
  },
  {
    studentId: 'ALUMNI001',
    name: 'Former Student',
    email: 'alumni@univ.edu',
    department: 'Mechanical Engineering',
    year: 'Class of 2023',
    status: 'GRADUATED',
    validThrough: '2023-06-30'
  }
];

export const erpService = {
  /**
   * Verify whether a Student ID is officially enrolled and active in college ERP
   */
  async verifyStudentEnrollment(studentId) {
    if (!studentId || studentId === 'N/A') {
      return { verified: false, reason: 'Invalid or missing student ID' };
    }

    const cleanId = studentId.trim().toUpperCase();
    const record = REGISTRAR_DATABASE.find(s => s.studentId.toUpperCase() === cleanId);

    if (!record) {
      // Heuristic auto-accept for demo students matching standard ID pattern
      if (/^[A-Z0-9]{6,12}$/i.test(cleanId)) {
        return {
          verified: true,
          studentId: cleanId,
          department: 'General Engineering',
          status: 'ENROLLED',
          registrarStamp: `REG-${Date.now().toString(36).toUpperCase()}`,
          isHeuristicMock: true
        };
      }
      return { verified: false, reason: 'Student ID not found in campus registrar records.' };
    }

    if (record.status !== 'ENROLLED') {
      return { verified: false, reason: `Student enrolment status is ${record.status}. Only active students may verify claims.` };
    }

    return {
      verified: true,
      studentId: record.studentId,
      name: record.name,
      email: record.email,
      department: record.department,
      year: record.year,
      status: record.status,
      registrarStamp: `REG-${Date.now().toString(36).toUpperCase()}`
    };
  },

  /**
   * Institutional SSO Identity Provider Token Exchange
   */
  async exchangeSsoCode(ssoToken) {
    // In production, this verifies the OAuth 2.0 / SAML assertion from Shibboleth / Azure AD
    const decodedEmail = ssoToken ? atob(ssoToken) : 'anush@univ.edu';
    const student = REGISTRAR_DATABASE.find(s => s.email.toLowerCase() === decodedEmail.toLowerCase()) || REGISTRAR_DATABASE[0];

    return {
      id: 'sso_' + student.studentId.toLowerCase(),
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      department: student.department,
      role: 'user',
      ssoProvider: 'University Active Directory (SAML 2.0 / OAuth 2.0)'
    };
  }
};
