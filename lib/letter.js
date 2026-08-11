import { COMPANY, FOOTER_NOTE } from './company';
import { formatHash } from './hash';

// Letterhead: logo left, company name + address right.
function letterhead(logoDataUrl) {
  const nameBlock = {
    stack: [
      { text: COMPANY.name, style: 'companyName' },
      ...COMPANY.addressLines.map((l) => ({ text: l, style: 'companyAddress' })),
    ],
  };

  const columns = logoDataUrl
    ? [{ image: logoDataUrl, width: 52 }, { ...nameBlock, width: '*', margin: [10, 4, 0, 0] }]
    : [{ ...nameBlock, width: '*' }];

  return [
    { columns, columnGap: 0 },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#A63200' }], margin: [0, 8, 0, 12] },
  ];
}

const B = (items) => ({ ul: items, style: 'bullet', margin: [8, 4, 0, 8] });

export function buildLetterContent(record, logoDataUrl) {
  const { fullName, employeeId, dateOfJoining, designation, refNumber, hash } = record;

  return [
    ...letterhead(logoDataUrl),

    { text: 'APPOINTMENT LETTER', style: 'title' },

    {
      style: 'meta',
      table: {
        widths: [90, '*'],
        body: [
          ['Date:', dateOfJoining],
          ['To:', fullName],
          ['Employee ID:', employeeId],
          ['Reference:', refNumber],
          ['Subject:', 'Employment Joining Letter'],
        ],
      },
      layout: 'noBorders',
    },

    { text: `Dear ${fullName},`, style: 'para', margin: [0, 10, 0, 8] },

    {
      text: `We are pleased to appoint you as a employee of ${COMPANY.name} (hereinafter referred to as "the Company"), under the following statutory and contractual terms and conditions:`,
      style: 'para',
    },

    { text: '1. Nature of Employment, Deployment, and Remuneration', style: 'h2' },
    {
      text: `You are engaged as a full-time employee in the capacity of ${designation}. Your gross wages will be strictly comply with the statutory minimum wage applicable to your geographical location. Your salary is inclusive of all Statutory Compliance such as Provident Fund (PF) and Employees' State Insurance (ESIC).`,
      style: 'para',
    },
    B([
      { text: [{ text: 'Statutory Contributions: ', bold: true }, "The Company shall make mandatory employer contributions towards the Employees' Provident Fund (EPF) and Employees' State Insurance (ESIC) as per the statutory rates defined under the Code on Social Security, 2020, where applicable. The employee's share of such statutory contributions shall be deducted from your Gross Wages as legally authorized. If your wage exceeds the statutory ceiling for ESIC applicability, no such deductions or contributions will be made."] },
      { text: [{ text: 'Bonus: ', bold: true }, "In compliance with Section 26(1) of the Code on Wages, 2019, your remuneration includes your statutory minimum bonus. This amount shall be paid to you on a monthly basis as an 'Advance Statutory Bonus' and will be fully reconciled against your annual statutory bonus entitlement at the close of the accounting year."] },
      { text: [{ text: 'Statutory Provident Fund Exemption: ', bold: true }, "If your legally calculated wages exceed the statutory wage ceiling notified by the Central Government, and subject to your explicit written declaration that you do not possess a pre-existing Universal Account Number (UAN) or prior membership in the Employees' Provident Fund (EPF) scheme, you can be classified as an 'exempted employee' under the Code on Social Security, 2020. Consequently, no statutory EPF contributions shall be deducted from your wages or matched by the Company. Should it be discovered that you possess an active UAN, this exemption shall immediately become legally void, and mandatory statutory deductions will commence as required by law."] },
    ]),

    { text: '2. Transfer and Redeployment Policy', style: 'h2' },
    {
      text: 'Your employment is highly dynamic, and your services are transferable. By accepting this appointment, you explicitly agree that the Company reserves the absolute right to transfer or redeploy you to any other client location, department, or branch across India based on business requirements.',
      style: 'para',
    },
    B([
      { text: [{ text: 'Notice of Transfer: ', bold: true }, 'In the event of a transfer, the Company will issue a formal deployment notice protecting your statutory minimum wages.'] },
      { text: [{ text: 'Voluntary Resignation in Lieu of Transfer: ', bold: true }, 'If you are unwilling or unable to accept the new deployment location, you hold the right to tender your resignation. In such specific instances of transfer-refusal, the Company will waive the standard 30-day notice period requirement, allowing you to be relieved immediately without any notice-pay recovery penalties.'] },
    ]),

    { text: '3. Code of Conduct and Disciplinary Termination', style: 'h2' },
    {
      text: 'The Company strictly enforces workplace discipline. Any deficiency in work, unauthorized absence, or violation of client site protocols will be subject to the following disciplinary procedure:',
      style: 'para',
    },
    B([
      { text: [{ text: 'First Instance (Warning): ', bold: true }, 'Upon observing a deficiency or misconduct, the Company will conduct a preliminary internal investigation (domestic inquiry) adhering to the principles of natural justice. If you are found at fault, a formal Written Warning will be issued and placed in your service record.'] },
      { text: [{ text: 'Repeat Offense (Termination for Cause): ', bold: true }, 'If a subsequent instance of deficiency or misconduct occurs, a formal domestic inquiry will be conducted where you will be given an opportunity to show cause. If the inquiry formally establishes your fault, your employment will be immediately terminated as a disciplinary punishment.'] },
      'In accordance with the Industrial Relations Code, 2020, termination inflicted as a disciplinary punishment does not constitute "retrenchment," and you shall not be entitled to retrenchment compensation or notice pay.',
    ]),

    { text: '4. Full and Final (FnF) Settlement', style: 'h2' },
    {
      text: 'In the event of your resignation (including refusal of transfer) or your dismissal resulting from disciplinary action, your Full and Final settlement wages shall be credited directly to your registered bank account within two (2) working days from your date of resignation or dismissal.',
      style: 'para',
    },

    { text: '5. Standard Notice Period (Non-Transfer Scenarios)', style: 'h2' },
    {
      text: "For any routine resignation not related to a transfer refusal, you are required to provide 30 days' notice in writing to the Company, or pay wages in lieu of such notice.",
      style: 'para',
    },

    { text: '6. Digital Communication Declaration', style: 'h2' },
    {
      text: 'I hereby declare that the mobile number provided during joining, which was used to authenticate this weblink along with your aadhar no is my official registered mobile number. I agree that any digital communication, transfer order, show-cause notice, or electronic form submitted using this number shall be deemed as my legally binding, voluntary action.',
      style: 'para',
    },
    {
      text: [
        { text: 'Digital Execution and Aadhaar Identity Verification: ', bold: true },
        'In accordance with Section 142 of the Code on Social Security, 2020, your identity has been verified through your Aadhaar number for the purposes of employment and statutory benefit registration. By entering your Aadhaar-linked mobile number and authenticating this document via your personal details, you electronically execute this Appointment Letter. You acknowledge that this digitally authenticated digital signature serves as your absolute, legally binding acceptance of all terms, conditions, and transferability clauses contained herein.',
      ],
      style: 'para',
    },

    { text: 'APPENDIX A: CODE OF CONDUCT AND DISCIPLINARY POLICY', style: 'h1', pageBreak: 'before' },
    {
      text: `This Code of Conduct forms an integral and legally binding part of your Appointment Letter with ${COMPANY.name} (the "Company"). Strict adherence to these rules is a mandatory condition of your employment.`,
      style: 'para',
    },

    { text: '1. Workplace Discipline & Performance Standards', style: 'h2' },
    {
      text: 'Employees are required to maintain absolute discipline, perform their duties diligently, and adhere strictly to the protocols of the Company and the Principal Employer (Client). Any deficiency in service, including but not limited to sleeping on duty, unauthorized absence, or insubordination, shall be classified as misconduct.',
      style: 'para',
    },

    { text: '2. Disciplinary Action for General Misconduct', style: 'h2' },
    { text: 'In the event of general misconduct or performance deficiency, the Company shall adhere to the following procedure:', style: 'para' },
    B([
      { text: [{ text: 'First Instance: ', bold: true }, 'A preliminary investigation will be conducted. If found at fault, a formal Written Warning / Show Cause Notice will be issued.'] },
      { text: [{ text: 'Repeat Offense: ', bold: true }, 'A formal domestic inquiry shall be conducted in accordance with the principles of natural justice. If guilt is established, the employee shall be terminated as a disciplinary punishment. Such termination does not constitute "retrenchment" under the Industrial Relations Code, 2020, and no retrenchment compensation or notice pay shall be payable.'] },
    ]),

    { text: '3. Gross Misconduct: Theft, Fraud, and Illegal Activities', style: 'h2' },
    {
      text: 'Any act of theft, fraud, misappropriation of company or client property, sabotage, violence, or any illegal activity constitutes Gross Misconduct. The Company operates a zero-tolerance policy for such offenses.',
      style: 'para',
    },

    { text: '4. Suspension Pending Inquiry (Administrative Leave)', style: 'h2' },
    {
      text: 'In the event of an allegation of Gross Misconduct (such as theft or illegal activities) that threatens the safety, security, or operations of the Company or its clients, the employee shall be immediately placed on Suspension Pending Inquiry.',
      style: 'para',
    },
    B([
      { text: [{ text: 'Investigation Timeline: ', bold: true }, 'The Company will ordinarily complete the investigation and domestic inquiry within two (2) days, but no later than ninety (90) days from the date of suspension. In case the employee is caught in the act and its clear beyond any reasonable doubt, then the employee will intimated on spot of his termination and no further investigations will be undertaken in such cases.'] },
      { text: [{ text: 'Subsistence Allowance: ', bold: true }, 'During this period of suspension, the employee shall not report to work but shall be paid a Subsistence Allowance at the rate of fifty percent (50%) of their standard wages, in strict compliance with Section 38 of the Industrial Relations Code, 2020.'] },
      { text: [{ text: 'Exoneration: ', bold: true }, 'If the inquiry concludes that the employee is not guilty of the charges, their suspension shall be revoked, they shall be immediately reinstated to active duty, and the Company shall pay the remaining balance of their wages for the suspension period to restore their full standard remuneration.'] },
      { text: [{ text: 'Dismissal for Cause: ', bold: true }, 'If the domestic inquiry formally establishes guilt, the employee shall be immediately terminated for cause. The termination shall be effective from the date of the dismissal order, and no further wages shall be payable beyond the subsistence allowance already disbursed.'] },
    ]),

    { text: '5. Statutory Forfeitures and Recoveries', style: 'h2' },
    {
      text: 'In the event an employee is dismissed for Gross Misconduct (including theft, fraud, misappropriation, or damage to property), the Company explicitly reserves its statutory rights to:',
      style: 'para',
    },
    B([
      { text: [{ text: 'Forfeit Statutory Bonus: ', bold: true }, 'The employee shall be absolutely disqualified from receiving any statutory bonus under Section 29 of the Code on Wages, 2019.'] },
      { text: [{ text: 'Forfeit Gratuity: ', bold: true }, "The Company shall wholly or partially forfeit the employee's accrued gratuity (if any) to recover the extent of damages or losses caused, or for offenses involving moral turpitude, pursuant to Section 53(6) of the Code on Social Security, 2020."] },
      { text: [{ text: 'Wage Deductions: ', bold: true }, "The Company may initiate lawful deductions from the employee's Full and Final settlement for any monetary loss or damage to goods expressly entrusted to the employee, after providing a show-cause opportunity, under Section 21 of the Code on Wages, 2019."] },
    ]),

    // Authenticity block — closes every letter.
    {
      margin: [0, 18, 0, 0],
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: FOOTER_NOTE, style: 'authTitle' },
            { text: `Reference: ${refNumber}   |   Employee ID: ${employeeId}`, style: 'authLine' },
            { text: 'Document Integrity Hash (SHA-256):', style: 'authLine', margin: [0, 4, 0, 1] },
            { text: formatHash(hash), style: 'hash' },
            {
              text: 'Any alteration to the name, employee ID, date of joining, designation or reference number on this document will not match the hash above. Verify at the Company’s letter verification page.',
              style: 'authNote',
            },
          ],
          margin: [8, 8, 8, 8],
          fillColor: '#F7F3F1',
        }]],
      },
      layout: 'noBorders',
      unbreakable: true,
    },
  ];
}
